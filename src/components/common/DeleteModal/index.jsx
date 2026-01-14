import React from "react";
import { Modal, Box, Typography, Button, createTheme } from "@mui/material";
import SurveyIcon from "../SurveyIcons/SurveyIcon";
import styles from "./DeleteModal.module.css";
import { palette } from "~/theme/palette";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";

const DeleteModal = ({
  title,
  open,
  handleClose,
  handleDelete,
  description,
}) => {
  const theme = createTheme({
    palette: palette("light"),
  });

  const { t } = useTranslation(NAMESPACES.MANAGE);
  const { t: tDesign } = useTranslation(NAMESPACES.DESIGN_CORE);
  const modalTitle = title || t("action_btn.delete");

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="delete-modal">
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

        <Typography
          id="modal-description"
          sx={{ mt: 2, overflowWrap: "break-word" }}
        >
          {description}
        </Typography>
        <Box display="flex" justifyContent="center" mt={4} gap={3}>
          <Button
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              textTransform: "capitalize",
            }}
            size="medium"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleClose();
            }}
          >
            {tDesign("cancel")}
          </Button>
          <Button
            sx={{ textTransform: "capitalize" }}
            size="medium"
            type="submit"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleDelete();
            }}
          >
            {tDesign("confirm")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModal;
