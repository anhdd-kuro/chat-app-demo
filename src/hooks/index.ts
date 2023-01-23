import { getRecipientEmails } from "@/utils";
import { auth, firestore } from "@/setup/firebase";
import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import type { AppUser, Conversation } from "@/types";

export const useRecipient = (conversationUsers: Conversation["users"]) => {
  const [loggedInUser] = useAuthState(auth);

  // get recipient email
  const recipientEmails = getRecipientEmails(conversationUsers, loggedInUser);

  // get recipient avatar
  const queryGetRecipients = query(
    collection(firestore, "users"),
    where("email", "in", recipientEmails),
  );

  const [recipientsSnapshot] = useCollection(queryGetRecipients);

  // recipientSnapshot?.docs could be an empty array, leading to docs[0] being undefined
  // so we have to force "?" after docs[0] because there is no data() on "undefined"
  const recipients = recipientsSnapshot?.docs.map((doc) => doc?.data() as AppUser);

  return {
    recipients,
    recipientEmails,
  };
};
