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
  action: () => void;
  onClose?: () => void;
  isActionDisabled: boolean;
  isOpen: boolean;
  closeText?: string;
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
}) => {
  const closeNewConversationDialog = () => {
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onClose={closeNewConversationDialog}>
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
