import { firestore } from "@/setup/firebase";
import { collection, orderBy, query, where, Timestamp } from "firebase/firestore";
import type { Conversation, IDBMessage, IMessage } from "@/types";
import type { User } from "firebase/auth";

export const getRecipientEmails = (
  conversationUsers: Conversation["users"],
  loggedInUser?: User | null,
) => conversationUsers.filter((email) => email !== loggedInUser?.email);

export const generateQueryGetMessages = (conversationId?: string) =>
  query(
    collection(firestore, "messages"),
    where("conversation_id", "==", conversationId),
    orderBy("sent_at", "asc"),
  );

export const transformMessage = (message: IDBMessage): IMessage => {
  return {
    ...message.data,
    id: message.id,
    sent_at: convertFirestoreTimestampToString(message.data.sent_at),
  };
};

export const convertFirestoreTimestampToString = (timestamp: unknown) => {
  if (!timestamp) return "";

  if (!(timestamp instanceof Timestamp)) return "";

  return new Date(timestamp.toDate().getTime()).toLocaleString();
};
