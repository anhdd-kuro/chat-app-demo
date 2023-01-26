import functions from "firebase-functions";
import { firestore } from "firebase-admin";
import type { TypingUser } from "@/types";

const TYPING_TIMEOUT = 20 * 1000; // 20 seconds

export const monitorTypingUsers = functions.firestore
  .document("conversations/{conversationId}")
  .onUpdate(async (change, context) => {
    const previousData = change.before.data();
    const currentData = change.after.data();
    const typingUsers = (currentData?.typingUsers || []) as TypingUser[];
    const previousTypingUsers = (previousData?.typingUsers || []) as TypingUser[];

    const now = Date.now();
    typingUsers.forEach(async (user) => {
      if (!previousTypingUsers.includes(user) || now - user.timestamp > TYPING_TIMEOUT) {
        const conversationRef = firestore()
          .collection("conversations")
          .doc(context.params.conversationId);

        await conversationRef.update({
          typingUsers: firestore.FieldValue.arrayRemove(user.email),
        });
      }
    });
  });
