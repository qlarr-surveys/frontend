import { Box, Modal, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import styles from "./ResponseDelete.module.css";

export const ResponseDelete = ({ open, onClose, onDelete }) => {
  const { t } = useTranslation("manage");
  return (
    <Modal
      sx={{
        ".MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={styles.wrapper}>
        <Typography variant="h5" fontWeight={600}>
          {t("responses.title_delete_response")}
        </Typography>
        <Box className={styles.separator}></Box>
        <Box className={styles.action}>
          <Button onClick={onClose} color="primary" variant="contained">
            {t("action_btn.cancel")}
          </Button>
          <Button variant="secondary" onClick={onDelete}>
            {t("action_btn.delete")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
