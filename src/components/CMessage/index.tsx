import { auth } from "@/setup/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { Avatar } from "@mui/material";
import type { IMessage } from "@/types";

export const CMessage = ({ message, avatarUrl }: { message: IMessage; avatarUrl?: string }) => {
  const [loggedInUser] = useAuthState(auth);

  const isLoggedUser = loggedInUser?.email === message.user;

  const MessageType = isLoggedUser ? StyledSenderMessage : StyledReceiverMessage;

  return (
    <MessageType>
      {message.text}
      <StyledTimestamp>{message.sent_at}</StyledTimestamp>
      {!isLoggedUser && <StyledAvatar src={avatarUrl} />}
    </MessageType>
  );
};

const StyledMessage = styled.div`
  width: fit-content;
  word-break: break-all;
  max-width: 90%;
  min-width: 30%;
  padding: 1.2rem 1.2rem 2rem;
  border-radius: 8px;
  margin: 10px;
  position: relative;
`;

const StyledSenderMessage = styled(StyledMessage)`
  margin-left: auto;
  background-color: #dcf8c6;
`;

const StyledReceiverMessage = styled(StyledMessage)`
  background-color: whitesmoke;
`;

const StyledTimestamp = styled.span`
  color: gray;
  padding: 10px;
  font-size: x-small;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
`;

const StyledAvatarWrapper = styled.span`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-80%, -50%);
`;

const StyledAvatar = ({ src }: { src?: string }) => {
  return (
    <StyledAvatarWrapper>
      <Avatar src={src} />
    </StyledAvatarWrapper>
  );
};
