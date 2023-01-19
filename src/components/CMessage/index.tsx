import { auth } from "@/setup/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import type { IMessage } from "@/types";

export const CMessage = ({ message }: { message: IMessage }) => {
  const [loggedInUser] = useAuthState(auth);

  const MessageType =
    loggedInUser?.email === message.user ? StyledSenderMessage : StyledReceiverMessage;

  return (
    <MessageType>
      {message.text}
      <StyledTimestamp>{message.sent_at}</StyledTimestamp>
    </MessageType>
  );
};

const StyledMessage = styled.p`
  width: fit-content;
  word-break: break-all;
  max-width: 90%;
  min-width: 30%;
  padding: 15px 15px 30px;
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
