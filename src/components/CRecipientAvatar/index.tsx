import Avatar from "@mui/material/Avatar";
import styled from "styled-components";
import type { useRecipient } from "@/hooks";

type Props = ReturnType<typeof useRecipient>;

const StyledAvatar = styled(Avatar)`
  margin: 5px 15px 5px 5px;
`;

export const CRecipientAvatar = ({ recipient, recipientEmail }: Props) => {
  return recipient?.photoURL ? (
    <StyledAvatar src={recipient.photoURL} />
  ) : (
    <StyledAvatar>{recipientEmail && recipientEmail[0].toUpperCase()}</StyledAvatar>
  );
};
