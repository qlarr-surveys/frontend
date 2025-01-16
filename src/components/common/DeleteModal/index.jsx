import React from "react";
import { Modal, Box, Typography, Button, createTheme } from "@mui/material";
import SurveyIcon from "../SurveyIcons/SurveyIcon";
import styles from "./DeleteModal.module.css";
import { palette } from "~/theme/palette";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation(["manage", "design", "run"]);
  const modalTitle = title || t("action_btn.delete");

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="delete-modal">
      <Box className={styles.modalBox}>
        <Box display="flex" gap={2} justifyContent="center" alignItems="center">
          {title === "Delete" && (
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
            onClick={handleClose}
          >
            {t("cancel")}
          </Button>
          <Button
            sx={{ textTransform: "capitalize" }}
            size="medium"
            type="submit"
            variant="secondary"
            onClick={handleDelete}
          >
            {t("confirm")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModal;
