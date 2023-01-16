import { CRecipientAvatar } from "../CRecipientAvatar";
import { Conversation } from "@/types";
import { useRecipient } from "@/hooks";
import { useRouter } from "next/router";
import styled from "styled-components";

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-all;
  :hover {
    background-color: #e9eaeb;
  }
`;

export const CConversationSelect = ({
  id,
  conversationUsers,
}: {
  id: string;
  conversationUsers: Conversation["users"];
}) => {
  const { recipient, recipientEmail } = useRecipient(conversationUsers);

  const router = useRouter();

  const onSelectConversation = () => {
    router.push(`/conversations/${id}`);
  };

  return (
    <StyledContainer onClick={onSelectConversation}>
      <CRecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />
      <span>{recipientEmail}</span>
    </StyledContainer>
  );
};
