import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export type CDialogProps = {
  title: string;
  contentText: string;
  children: React.ReactNode;
  actionText: string;
  isActionDisabled: boolean;
  isOpen: boolean;
  closeText?: string;
  action: () => void;
  onClose?: () => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
};

export const CDialog: React.FC<CDialogProps> = ({
  action,
  actionText,
  children,
  contentText,
  isActionDisabled,
  title,
  onClose,
  isOpen,
  closeText = "Cancel",
  onKeyUp,
}) => {
  const closeNewConversationDialog = () => {
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onClose={closeNewConversationDialog} onKeyUp={onKeyUp}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeNewConversationDialog}>{closeText}</Button>
        <Button
          disabled={isActionDisabled}
          onClick={() => {
            action();
            closeNewConversationDialog();
          }}
        >
          {actionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
