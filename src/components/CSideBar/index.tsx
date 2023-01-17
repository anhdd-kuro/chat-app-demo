import { auth, firestore } from "@/setup/firebase";
import { CConversationSelect, CDialog } from "@/components";
import { Avatar, Button, IconButton, TextField, Tooltip } from "@mui/material";
import styled from "styled-components";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertical from "@mui/icons-material/MoreVert";
import LogOutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { z } from "zod";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { toast } from "react-toastify";
import type { Conversation } from "@/types";

export const CSideBar = () => {
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);

  const [loggedInUser] = useAuthState(auth);

  const [recipientEmail, setRecipientEmail] = useState("");

  const [searchConversationByEmail, setSearchConversationByEmail] = useState("");

  const isInvitingSelf = recipientEmail === loggedInUser?.email;

  const isValidEmail = z.string().email().safeParse(recipientEmail).success;

  // check if conversation already exists between the current logged in user and recipient
  const queryGetConversationsForCurrentUser = query(
    collection(firestore, "conversations"),
    where("users", "array-contains", loggedInUser?.email),
  );

  const [conversationsSnapshot] = useCollection(queryGetConversationsForCurrentUser);

  const conversationFilterBySearch = useMemo(() => {
    return conversationsSnapshot?.docs.filter((conversation) => {
      const conversationData = conversation.data() as Conversation;
      return conversationData.users.some((email) => email.includes(searchConversationByEmail));
    });
  }, [conversationsSnapshot, searchConversationByEmail]);

  const isConversationAlreadyExists = (recipientEmail: string) =>
    conversationsSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail),
    );

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      toast.error("Error logging out");
      console.log("ERROR LOGGING OUT", error);
    }
  };

  const createConversation = async () => {
    setRecipientEmail("");

    if (!recipientEmail) {
      return;
    }

    if (isInvitingSelf) {
      toast.error("You can't invite yourself");
      return;
    }

    if (!isValidEmail || isConversationAlreadyExists(recipientEmail)) {
      toast.error("Invalid email address or conversation already exists");
      return;
    }

    await addDoc(collection(firestore, "conversations"), {
      users: [loggedInUser?.email, recipientEmail],
    });
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <Tooltip title={loggedInUser?.email} placement="right">
          <StyledAvatar src={loggedInUser?.photoURL || ""} />
        </Tooltip>

        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertical />
          </IconButton>
          <IconButton onClick={logout}>
            <LogOutIcon />
          </IconButton>
        </div>
      </StyledHeader>
      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput
          onChange={(e) => setSearchConversationByEmail(e.target.value)}
          placeholder="Search in conversations"
        />
      </StyledSearch>

      <StyledSideBarButton
        onClick={() => {
          setIsNewConversationDialogOpen(true);
        }}
      >
        Start a new conversation
      </StyledSideBarButton>

      {/* List of conversations */}
      {conversationFilterBySearch?.map((conversation) => (
        <CConversationSelect
          key={conversation.id}
          id={conversation.id}
          conversationUsers={(conversation.data() as Conversation).users}
        />
      ))}
      <CDialog
        isOpen={isNewConversationDialogOpen}
        title="New Conversation"
        actionText="Create"
        contentText="Please enter a Google email address for the user you wish to chat with"
        isActionDisabled={!recipientEmail || !isValidEmail}
        action={createConversation}
        onClose={() => setIsNewConversationDialogOpen(false)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            createConversation();
            setIsNewConversationDialogOpen(false);
          }
        }}
      >
        <TextField
          autoFocus
          label="Email Address"
          type="email"
          fullWidth
          variant="standard"
          value={recipientEmail}
          onChange={(event) => {
            setRecipientEmail(event.target.value);
          }}
        />
      </CDialog>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  border-right: 1px solid whitesmoke;
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;

  > div {
    display: flex;
    align-items: center;
    gap: 0 0.5rem;
  }
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 2px;
`;

const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`;

const StyledSideBarButton = styled(Button)`
  font-weight: 700;
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;
