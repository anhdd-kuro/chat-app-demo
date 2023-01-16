import { AppUser, Conversation } from "../types";
import { getRecipientEmail } from "@/utils";
import { auth, firestore } from "@/setup/firebase";
import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

export const useRecipient = (conversationUsers: Conversation["users"]) => {
  const [loggedInUser] = useAuthState(auth);

  // get recipient email
  const recipientEmail = getRecipientEmail(conversationUsers, loggedInUser);

  // get recipient avatar
  const queryGetRecipient = query(
    collection(firestore, "users"),
    where("email", "==", recipientEmail),
  );
  const [recipientsSnapshot] = useCollection(queryGetRecipient);

  // recipientSnapshot?.docs could be an empty array, leading to docs[0] being undefined
  // so we have to force "?" after docs[0] because there is no data() on "undefined"
  const recipient = recipientsSnapshot?.docs[0]?.data() as AppUser | undefined;

  return {
    recipient,
    recipientEmail,
  };
};
