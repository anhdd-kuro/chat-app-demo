import { firestore } from "@/setup/firebase";
import { collection, orderBy, query, where, Timestamp } from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
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

export const transformMessage = (message: QueryDocumentSnapshot<DocumentData>) =>
  ({
    id: message.id,
    ...message.data(), // spread out conversation_id, text, sent_at, user
    sent_at: convertFirestoreTimestampToString(message.data().sent_at),
  } as IMessage);

export const convertFirestoreTimestampToString = (timestamp?: Timestamp | unknown) => {
  if (!timestamp) return null;

  if (!(timestamp instanceof Timestamp)) return null;

  return new Date(timestamp.toDate().getTime()).toLocaleString();
};
