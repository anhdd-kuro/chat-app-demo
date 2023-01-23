import { Chip } from "@mui/material";

export type CTagProps = {
  clickable?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  label: string;
};

export const CTag: React.FC<CTagProps> = ({ ...props }) => {
  return <Chip {...props} />;
};
