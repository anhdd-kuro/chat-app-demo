import Avatar from "@mui/material/Avatar";
import styled from "styled-components";
import { Tooltip } from "@mui/material";
import type { AppUser } from "@/types";

type Props = {
  recipient: AppUser;
};

const StyledAvatar = styled(Avatar)`
  line-height: 0;
  font-size: 0.8em;
  font-weight: 700;
`;

export const CRecipientAvatar = ({ recipient }: Props) => {
  return (
    <Tooltip title={recipient.email}>
      {recipient.photoURL ? (
        <StyledAvatar src={recipient.photoURL} />
      ) : (
        <StyledAvatar>{recipient.email[0].toUpperCase()}</StyledAvatar>
      )}
    </Tooltip>
  );
};
