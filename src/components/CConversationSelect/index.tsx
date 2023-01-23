import { CRecipientAvatar } from "../CRecipientAvatar";
import { useRecipient } from "@/hooks";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Avatar, Tooltip } from "@mui/material";
import type { Conversation } from "@/types";

export const CConversationSelect = ({
  id,
  conversationUsers,
}: {
  id: string;
  conversationUsers: Conversation["users"];
}) => {
  const { recipients = [] } = useRecipient(conversationUsers);

  const router = useRouter();

  const onSelectConversation = () => {
    router.push(`/conversations/${id}`);
  };

  return (
    <StyledContainer onClick={onSelectConversation}>
      <StyledAvatars>
        {recipients.length > 3 ? (
          <>
            {recipients?.slice(0, 3).map((recipient) => (
              <CRecipientAvatar key={recipient.email} recipient={recipient} />
            ))}
            <Tooltip
              title={recipients
                .slice(3, recipients.length)
                .flatMap((u) => u.email)
                .join(", ")}
            >
              <Avatar>+{recipients.length - 3}</Avatar>
            </Tooltip>
          </>
        ) : (
          recipients?.map((recipient) => (
            <CRecipientAvatar key={recipient.email} recipient={recipient} />
          ))
        )}
      </StyledAvatars>
      <StyledEmailContainer>
        {recipients?.map((recipient, index) => (
          <span key={recipient.email}>
            {recipient.email}
            {index === recipients.length - 1 ? null : <span>, </span>}
          </span>
        ))}
      </StyledEmailContainer>
    </StyledContainer>
  );
};

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

const StyledAvatars = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;

  > * {
    margin: 0;
    :not(:first-child) {
      margin-left: -1.6rem;
    }
  }
`;

const StyledEmailContainer = styled.div`
  text-overflow: ellipsis;
  display: flex;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;
