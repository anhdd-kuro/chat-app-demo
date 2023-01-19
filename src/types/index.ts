import { z } from "zod";
import type { Timestamp } from "firebase/firestore";

export interface Conversation {
  users: string[];
}

export interface AppUser {
  email: string;
  lastSeen: Timestamp;
  photoURL: string;
}

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  text: z.string(),
  sent_at: z.string(),
  user: z.string(),
});

export interface IMessage extends z.infer<typeof MessageSchema> {}
