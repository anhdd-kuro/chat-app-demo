import { Conversation, DBMessageSchema } from "@/types";
import { auth, firestore } from "@/setup/firebase";
import { generateQueryGetMessages, getRecipientEmails, transformMessage } from "@/utils";
import { CConversationScreen, CSideBar } from "@/components";
import styled from "styled-components";
import { useAuthState } from "react-firebase-hooks/auth";
import Head from "next/head";
import { doc, getDoc, getDocs } from "firebase/firestore";
import type { GetServerSideProps } from "next";
import type { IMessage } from "@/types";

interface Props {
  conversation: Conversation;
  messages?: IMessage[];
}

const StyledContainer = styled.div`
  display: flex;
`;

const StyledConversationContainer = styled.div`
  flex-grow: 1;
  overflow: scroll;
  height: 100vh;
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const Conversation = ({ conversation, messages }: Props) => {
  const [loggedInUser] = useAuthState(auth);
  return (
    <StyledContainer>
      <Head>
        <title>Conversation with {getRecipientEmails(conversation.users, loggedInUser)}</title>
      </Head>

      <CSideBar />

      <StyledConversationContainer>
        {messages && <CConversationScreen conversation={conversation} messages={messages} />}
      </StyledConversationContainer>
    </StyledContainer>
  );
};

export default Conversation;

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async (context) => {
  const conversationId = context.params?.id;

  // get conversation, to know who we are chatting with
  const conversationRef = doc(firestore, "conversations", conversationId as string);
  const conversationSnapshot = await getDoc(conversationRef);

  // get all messages between logged in user and recipient in this conversation
  const queryMessages = generateQueryGetMessages(conversationId);

  const messagesSnapshot = await getDocs(queryMessages);

  const messagesDocs = messagesSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
  const parsedMessage = DBMessageSchema.array().safeParse(messagesDocs);
  console.log(parsedMessage);

  if (!parsedMessage.success)
    return {
      props: {
        conversation: conversationSnapshot.data() as Conversation,
      },
    };

  const transformedMessages = parsedMessage.data.map((m) => transformMessage(m));

  return {
    props: {
      conversation: conversationSnapshot.data() as Conversation,
      messages: transformedMessages,
    },
  };
};
