import { CLogo } from "../CLogo";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

export const CLoading: React.FC<{ text?: string }> = ({ text = "" }) => {
  return (
    <StyledContainer>
      <StyledImageWrapper>
        <CLogo />
        <p>{text}</p>
      </StyledImageWrapper>

      <CircularProgress />
    </StyledContainer>
  );
};
