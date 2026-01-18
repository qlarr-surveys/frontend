import { Box, Modal, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import styles from "./UserDelete.module.css";
import LoadingButton from "@mui/lab/LoadingButton";

export const UserDelete = ({ open, onClose, deleteUser, name, isLoading }) => {
  const { t } = useTranslation(NAMESPACES.MANAGE);
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
        <Typography>{t("users_manage.delete_title", { name })}</Typography>
        <Box className={styles.action}>
          <LoadingButton
            variant="contained"
            onClick={deleteUser}
            loading={isLoading}
          >
            {t("action_btn.delete")}
          </LoadingButton>
          <Button onClick={onClose}>{t("action_btn.cancel")}</Button>
        </Box>
      </Box>
    </Modal>
  );
};
