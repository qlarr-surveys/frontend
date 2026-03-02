import React from "react";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useBoolean } from "~/hooks/use-boolean";
import { getDirFromSession } from "~/utils/common";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import SupportDialog from "./SupportDialog";
import styles from "./SupportBubble.module.css";

const SupportBubble = () => {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const dialog = useBoolean();
  const isRtl = getDirFromSession() === "rtl";

  return (
    <>
      {!dialog.value && (
        <Tooltip title={t("support_bubble.title")} arrow placement="top">
          <Fab
            aria-label="support"
            className={styles.fab}
            onClick={dialog.onTrue}
            sx={{
              position: "fixed",
              bottom: 24,
              ...(isRtl ? { left: 24 } : { right: 24 }),
              zIndex: 1200,
              width: 56,
              height: 56,
              background: "#00B0E4",
              color: "#fff",
              "&:hover": {
                background: "#009ACC",
              },
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      )}
      <SupportDialog open={dialog.value} onClose={dialog.onFalse} />
    </>
  );
};

export default SupportBubble;
