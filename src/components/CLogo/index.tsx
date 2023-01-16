import LogoDevTwoTone from "@mui/icons-material/LogoDev";

export const CLogo: React.FC<{ size?: number }> = ({ size = 100 }) => {
  return <LogoDevTwoTone style={{ fontSize: `${size}px` }} />;
};
