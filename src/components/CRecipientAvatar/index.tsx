import Avatar from "@mui/material/Avatar";
import styled from "styled-components";
import { Tooltip } from "@mui/material";
import type { AppUser } from "@/types";

type Props = {
  recipient: AppUser;
};

const StyledAvatar = styled(Avatar)`
  margin: 5px 15px 5px 5px;
`;

export const CRecipientAvatar = ({ recipient }: Props) => {
  return (
    <Tooltip title={recipient.email}>
      <StyledAvatar src={recipient.photoURL} />
    </Tooltip>
  );
};
