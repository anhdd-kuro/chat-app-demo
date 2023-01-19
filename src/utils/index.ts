import { firestore } from "@/setup/firebase";
import { collection, orderBy, query, where, Timestamp } from "firebase/firestore";
import type { Conversation, IMessage } from "@/types";
import type { User } from "firebase/auth";

export const getRecipientEmail = (
  conversationUsers: Conversation["users"],
  loggedInUser?: User | null,
) => conversationUsers.find((userEmail) => userEmail !== loggedInUser?.email);

export const generateQueryGetMessages = (conversationId?: string) =>
  query(
    collection(firestore, "messages"),
    where("conversation_id", "==", conversationId),
    orderBy("sent_at", "asc"),
  );

export const transformMessage = (message: IMessage): IMessage => {
  return {
    ...message,
    sent_at: convertFirestoreTimestampToString(message.sent_at),
  };
};

export const convertFirestoreTimestampToString = (timestamp: unknown) => {
  if (!timestamp) return "";

  if (!(timestamp instanceof Timestamp)) return "";

  return new Date(timestamp.toDate().getTime()).toLocaleString();
};
