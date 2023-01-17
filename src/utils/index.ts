import { firestore } from "@/setup/firebase";
import { collection, orderBy, query, where } from "firebase/firestore";
import type { Conversation, IMessage } from "@/types";
import type { User } from "firebase/auth";
import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

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
    sent_at: message.data().sent_at
      ? convertFirestoreTimestampToString(message.data().sent_at as Timestamp)
      : null,
  } as IMessage);

export const convertFirestoreTimestampToString = (timestamp: Timestamp) =>
  new Date(timestamp.toDate().getTime()).toLocaleString();
