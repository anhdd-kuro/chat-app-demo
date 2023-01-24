import { CTag } from "../CTag";
import { auth, firestore } from "@/setup/firebase";
import { CConversationSelect, CDialog } from "@/components";
import { Avatar, Button, IconButton, TextField, Tooltip } from "@mui/material";
import styled from "styled-components";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertical from "@mui/icons-material/MoreVert";
import LogOutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import { useCallback, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { z } from "zod";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { toast } from "react-toastify";
import type { Conversation } from "@/types";

export const CSideBar = () => {
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);

  const [loggedInUser] = useAuthState(auth);

  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [currentlyTypingEmail, setCurrentlyTypingEmail] = useState("");

  const [searchConversationByEmail, setSearchConversationByEmail] = useState("");

  const isInvitingSelf = currentlyTypingEmail === loggedInUser?.email;

  const isValidRecipientEmails = useMemo(
    () => z.string().email().array().safeParse(recipientEmails).success,
    [recipientEmails],
  );

  const isValidEmail = useCallback((email: string) => {
    console.log(z.string().email().safeParse(email).success);
    return z.string().email().safeParse(email).success;
  }, []);

  // check if conversation already exists between the current logged in user and recipient
  const queryGetConversationsForCurrentUser = query(
    collection(firestore, "conversations"),
    where("users", "array-contains", loggedInUser?.email),
  );

  const [conversationsSnapshot] = useCollection(queryGetConversationsForCurrentUser);

  const conversationFilterBySearch = useMemo(() => {
    return conversationsSnapshot?.docs.filter((conversation) => {
      const conversationData = conversation.data() as Conversation;
      return conversationData.users.some((email) => email.includes(searchConversationByEmail));
    });
  }, [conversationsSnapshot, searchConversationByEmail]);

  const isConversationAlreadyExists = (recipientEmails: string[]) =>
    conversationsSnapshot?.docs.find((conversation) => {
      const currentUserInConversation = (conversation.data() as Conversation).users;
      return (
        currentUserInConversation.length === recipientEmails.length &&
        currentUserInConversation.every((u) => recipientEmails.includes(u))
      );
    });

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  const createConversation = async () => {
    setRecipientEmails([]);

    if (recipientEmails.length === 0) {
      toast.warning("Please add at least one email address");
      return;
    }

    if (!isValidRecipientEmails || isConversationAlreadyExists(recipientEmails)) {
      toast.error("Invalid email address or conversation already exists");
      return;
    }

    await addDoc(collection(firestore, "conversations"), {
      users: [loggedInUser?.email, ...recipientEmails],
      typingUsers: [],
    });
  };

  return (
    <StyledContainer>
      {/* Header */}
      <StyledHeader>
        <Tooltip title={loggedInUser?.email} placement="right">
          <StyledAvatar src={loggedInUser?.photoURL || ""} />
        </Tooltip>

        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertical />
          </IconButton>
          <Tooltip title="Logout" placement="right">
            <IconButton onClick={logout}>
              <LogOutIcon />
            </IconButton>
          </Tooltip>
        </div>
      </StyledHeader>

      {/* Search bar */}
      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput
          onChange={(e) => setSearchConversationByEmail(e.target.value)}
          placeholder="Search in conversations"
        />
      </StyledSearch>

      {/* Start a new conversation */}
      <StyledSideBarButton
        onClick={() => {
          setIsNewConversationDialogOpen(true);
        }}
      >
        Start a new conversation
      </StyledSideBarButton>

      {/* List of conversations */}
      {conversationFilterBySearch?.map((conversation) => (
        <CConversationSelect
          key={conversation.id}
          id={conversation.id}
          conversationUsers={(conversation.data() as Conversation).users}
        />
      ))}

      {/* New conversation dialog */}
      <CDialog
        isOpen={isNewConversationDialogOpen}
        title="New Conversation"
        actionText="Create"
        contentText="Please enter a gmail address then press enter to add users you wish to chat with"
        isActionDisabled={recipientEmails.length === 0 || !isValidRecipientEmails}
        action={createConversation}
        onClose={() => {
          setIsNewConversationDialogOpen(false);
          setRecipientEmails([]);
          setCurrentlyTypingEmail("");
        }}
      >
        <TextField
          autoFocus
          label="Email Address"
          type="email"
          fullWidth
          variant="standard"
          value={currentlyTypingEmail}
          onKeyUp={(e) => {
            if (e.key !== "Enter") return;

            if (!isValidEmail(currentlyTypingEmail)) {
              toast.error("Invalid email address");
              return;
            }

            if (isInvitingSelf) {
              toast.error("You can't invite yourself");
              return;
            }

            if (recipientEmails.includes(currentlyTypingEmail)) {
              toast.warning("Email already added");
              return;
            }

            setRecipientEmails((curVal) => {
              return [...curVal, currentlyTypingEmail];
            });
            setCurrentlyTypingEmail("");
          }}
          onChange={(e) => setCurrentlyTypingEmail(e.target.value)}
        />
        {recipientEmails.length > 0 && (
          <StyledEmailTagsContainer>
            {recipientEmails.map((email) => (
              <CTag
                key={email}
                label={email}
                onDelete={() => {
                  setRecipientEmails((curVal) => {
                    return curVal.filter((e) => e !== email);
                  });
                }}
              />
            ))}
          </StyledEmailTagsContainer>
        )}
      </CDialog>
    </StyledContainer>
  );
};

const StyledEmailTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  border-right: 1px solid whitesmoke;
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  height: 75px;

  > div {
    display: flex;
    align-items: center;
    gap: 0 0.5rem;
  }
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 2px;
`;

const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`;

const StyledSideBarButton = styled(Button)`
  font-weight: 700;
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;
