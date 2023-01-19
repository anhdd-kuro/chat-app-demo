import { z } from "zod";
import { Timestamp } from "firebase/firestore";

export interface Conversation {
  users: string[];
}

export interface AppUser {
  email: string;
  lastSeen: Timestamp;
  photoURL: string;
}

export const DBMessageSchema = z.object({
  id: z.string(),
  data: z.object({
    conversation_id: z.string(),
    text: z.string(),
    sent_at: z.instanceof(Timestamp),
    user: z.string(),
  }),
});

export interface IDBMessage extends z.infer<typeof DBMessageSchema> {}

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  text: z.string(),
  sent_at: z.string(),
  user: z.string(),
});

export interface IMessage extends z.infer<typeof MessageSchema> {}
