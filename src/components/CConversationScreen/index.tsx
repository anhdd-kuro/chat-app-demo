import { CMessage } from "../CMessage";
import { CRecipientAvatar } from "../CRecipientAvatar";
import { auth, firestore } from "@/setup/firebase";
import { useRecipient } from "@/hooks";
import { generateQueryGetMessages, transformMessage } from "@/utils";
import { DBMessageSchema } from "@/types";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import styled from "styled-components";
import IconButton from "@mui/material/IconButton";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Avatar, Tooltip } from "@mui/material";
import { DebounceInput } from "react-debounce-input";
import type { Conversation, IMessage } from "@/types";
import type { KeyboardEventHandler, MouseEventHandler } from "react";

const TYPING_TIMEOUT = 20 * 1000; // 20 seconds

export const CConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState("");
  const lastMessageRef = useRef<string>("");

  const [loggedInUser] = useAuthState(auth);

  const conversationUsers = conversation.users;

  const { recipients } = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id; // localhost:3000/conversations/:id

  const conversationRef = doc(firestore, "conversations", conversationId as string);
  const [conversationSnapshot] = useDocument(conversationRef);

  const queryGetMessages = generateQueryGetMessages(conversationId as string);

  const [messagesSnapshot, messagesLoading] = useCollection(queryGetMessages);

  const transformedMessages = useMemo(() => {
    if (!messagesSnapshot) return;
    const messagesDocs = messagesSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
    const parsedMessage = DBMessageSchema.array().safeParse(messagesDocs);

    if (!parsedMessage.success) return;

    return parsedMessage.data.map((m) => transformMessage(m));
  }, [messagesSnapshot]);

  const otherUsersTyping = useMemo(() => {
    if (!conversationSnapshot) return;
    const conversationData = conversationSnapshot.data() as Conversation | undefined;

    if (!conversationData) return;

    return conversationData.typingUsers.filter((user) => user.email !== loggedInUser?.email);
  }, [conversationSnapshot, loggedInUser?.email]);

  const typingUsersWithinTimeout = useMemo(() => {
    if (!otherUsersTyping) return;

    const nowTimeStamp = new Date().getTime();

    return otherUsersTyping.filter((user) => nowTimeStamp - user.timestamp < TYPING_TIMEOUT);
  }, [otherUsersTyping]);

  const typingUsersIntervalCheck = useRef<NodeJS.Timeout | null>(null);

  const addMessageToDbAndUpdateLastSeen = async () => {
    // update last seen in 'users' collection
    await setDoc(
      doc(firestore, "users", loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    ); // just update what is changed

    // add new message to 'messages' collection
    await addDoc(collection(firestore, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });

    // reset input field
    setNewMessage("");

    // scroll to bottom
    scrollToBottom();
  };

  const handleTypingStatus = useCallback(
    async (message: string) => {
      if (!conversationSnapshot) return;
      const conversationData = conversationSnapshot.data() as Conversation | undefined;

      if (!conversationData) return;

      const typingUserExcludeLoggedUser = conversationData.typingUsers?.filter(
        (user) => user.email !== loggedInUser?.email,
      );

      const currentUser = typingUserExcludeLoggedUser?.find((u) => u.email === loggedInUser?.email);
      const currentUserTimeStamp = currentUser?.timestamp;

      const nowTimeStamp = new Date().getTime();

      if (
        !message ||
        (currentUserTimeStamp && nowTimeStamp - currentUserTimeStamp > TYPING_TIMEOUT)
      ) {
        await setDoc(
          conversationRef,
          {
            typingUsers: typingUserExcludeLoggedUser,
          },
          { merge: true }, // just update what is changed
        );
        return;
      }

      await setDoc(
        conversationRef,
        {
          typingUsers: [
            ...typingUserExcludeLoggedUser,
            { email: loggedInUser?.email as string, timestamp: nowTimeStamp },
          ],
        },
        { merge: true }, // just update what is changed
      );
    },
    [conversationSnapshot, conversationRef, loggedInUser?.email],
  );

  useEffect(() => {
    typingUsersIntervalCheck.current = setInterval(() => {
      if (!typingUsersIntervalCheck.current) return;
      if (!navigator?.onLine) {
        clearInterval(typingUsersIntervalCheck.current);
        return;
      }

      if (!conversationSnapshot) return;
      const conversationData = conversationSnapshot.data() as Conversation | undefined;

      if (!conversationData) return;
      const loggedUserInTypingUsers = conversationData.typingUsers?.find(
        (u) => u.email === loggedInUser?.email,
      );
      if (!loggedUserInTypingUsers) return;

      const nowTimeStamp = new Date().getTime();
      const loggedUserTimeStamp = loggedUserInTypingUsers.timestamp;
      if (
        lastMessageRef.current === newMessage &&
        loggedUserTimeStamp &&
        nowTimeStamp - loggedUserTimeStamp > TYPING_TIMEOUT
      )
        handleTypingStatus("");
    }, 1 * 1000); // 30 seconds

    return () => {
      clearInterval(typingUsersIntervalCheck.current as NodeJS.Timeout);
    };
  }, [conversationSnapshot, loggedInUser?.email, newMessage, handleTypingStatus]);

  const handleOnTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
    lastMessageRef.current = event.target.value;
    handleTypingStatus(event.target.value);
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (!newMessage) return;

    addMessageToDbAndUpdateLastSeen();
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    if (!newMessage) return;

    addMessageToDbAndUpdateLastSeen();
  };

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const recipientCountLimit = 7;

  return (
    <StyledWrapper>
      <StyledRecipientHeader>
        <StyledRecipients>
          {recipients && (
            <>
              {recipients.slice(0, recipientCountLimit).map((recipient) => (
                <CRecipientAvatar key={recipient.email} recipient={recipient} />
              ))}
              {recipients.length > recipientCountLimit && (
                <>
                  <Tooltip
                    title={recipients
                      .slice(recipientCountLimit, recipients.length)
                      .flatMap((u) => u.email)
                      .join(", ")}
                  >
                    <Avatar>+{recipients.length - recipientCountLimit}</Avatar>
                  </Tooltip>
                </>
              )}
            </>
          )}
        </StyledRecipients>
        <StyledHeaderIcons>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </StyledHeaderIcons>
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {/* If front-end is loading messages behind the scenes, display messages retrieved from Next SSR (passed down from [id].tsx) */}
        {messagesLoading || !transformedMessages
          ? messages.map((message) => (
              <CMessage
                key={message.id}
                message={message}
                avatarUrl={
                  message.user === loggedInUser?.email && loggedInUser?.photoURL
                    ? loggedInUser.photoURL
                    : recipients?.find((user) => user.email === message.user)?.photoURL
                }
              />
            ))
          : // If front-end has finished loading messages, so now we have messagesSnapshot
            transformedMessages.map((message) => (
              <CMessage
                key={message.id}
                message={message}
                avatarUrl={
                  message.user === loggedInUser?.email && loggedInUser?.photoURL
                    ? loggedInUser.photoURL
                    : recipients?.find((user) => user.email === message.user)?.photoURL
                }
              />
            ))}

        {/* for auto scroll to the end when a new message is sent */}
        <EndOfMessagesForAutoScroll ref={endOfMessagesRef} />
      </StyledMessageContainer>

      {typingUsersWithinTimeout && typingUsersWithinTimeout.length > 0 && (
        <StyledTypingUsers>
          {typingUsersWithinTimeout.map((u) => u.email).join(", ")} are typing...
        </StyledTypingUsers>
      )}

      {/* Enter new message */}
      <StyledInputContainer>
        <InsertEmoticonIcon />
        <StyledDebounceInput
          value={newMessage}
          onChange={handleOnTyping}
          onKeyDown={sendMessageOnEnter}
          debounceTimeout={300}
        />
        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <SendIcon />
        </IconButton>
        <IconButton>
          <MicIcon />
        </IconButton>
      </StyledInputContainer>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  background-color: #e5ded8;
`;

const StyledTypingUsers = styled.div`
  position: sticky;
  bottom: 80px;
  padding: 0 1rem;
  text-align: right;
  font-style: italic;
`;

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 75px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledRecipients = styled.div`
  display: flex;
  gap: 0 5px;
  margin-right: auto;

  > * {
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const StyledHeaderIcons = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const StyledDebounceInput = styled(DebounceInput)`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const EndOfMessagesForAutoScroll = styled.div`
  margin-bottom: 30px;
`;
