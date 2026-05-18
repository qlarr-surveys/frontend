import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import styles from "./ConfirmActionModal.module.css";

const ConfirmActionModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmColor = "error",
  isLoading = false,
}) => {
  const handleClose = (event, reason) => {
    if (isLoading) return;
    onClose?.(event, reason);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-action-modal"
      sx={{
        ".MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box className={styles.modalBox}>
        <Typography
          id="confirm-action-modal"
          variant="h4"
          fontWeight={600}
          component="h2"
          textAlign="center"
        >
          {title}
        </Typography>

        {description && (
          <Typography
            id="modal-description"
            sx={{ mt: 2, overflowWrap: "break-word" }}
          >
            {description}
          </Typography>
        )}

        <Box display="flex" justifyContent="center" mt={4} gap={2}>
          <Button
            variant="text"
            size="medium"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClose?.();
            }}
            sx={{
              textTransform: "capitalize",
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {cancelLabel}
          </Button>
          <LoadingButton
            variant="contained"
            color={confirmColor}
            size="medium"
            type="submit"
            loading={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onConfirm?.();
            }}
            sx={{
              textTransform: "capitalize",
              backgroundColor: `${confirmColor}.dark`,
              color: "common.white",
              "&:hover": { backgroundColor: `${confirmColor}.darker` },
            }}
          >
            {confirmLabel}
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmActionModal;
