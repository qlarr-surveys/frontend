import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SurveyIcon from "../SurveyIcons/SurveyIcon";
import styles from "./DeleteModal.module.css";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";

const DeleteModal = ({
  title,
  open,
  onClose,
  onConfirm,
  description,
  isLoading = false,
}) => {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const modalTitle = title || t("action_btn.delete");

  const handleClose = (event, reason) => {
    if (isLoading) return;
    onClose?.(event, reason);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-modal"
      sx={{
        ".MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box className={styles.modalBox}>
        <Box display="flex" gap={2} justifyContent="center" alignItems="center">
          {!title && (
            <SurveyIcon name="delete" color="#000" size="1.75em" />
          )}
          <Typography
            id="delete-modal"
            variant="h4"
            fontWeight={600}
            component="h2"
          >
            {modalTitle}
          </Typography>
        </Box>

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
            {t("action_btn.cancel")}
          </Button>
          <LoadingButton
            variant="contained"
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
              backgroundColor: "error.dark",
              color: "common.white",
              "&:hover": { backgroundColor: "error.darker" },
            }}
          >
            {t("action_btn.delete")}
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModal;
