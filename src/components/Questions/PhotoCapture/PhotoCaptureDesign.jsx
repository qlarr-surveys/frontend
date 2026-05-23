import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { getForegroundColor } from "~/components/Questions/utils";

import styles from "./PhotoCaptureDesign.module.css";
import { useSelector } from "react-redux";

function PhotoCaptureDesign({ code }) {
  const theme = useTheme();

  const state = useSelector((state) => {
    return state.designState[code];
  });

  const lang = useSelector((state) => {
    return state.designState.langInfo.lang;
  });

  // The hint sits on the question card (survey paper color).
  const hintColor =
    theme.contrast?.onPaper ||
    getForegroundColor(theme.palette.background.paper);

  return (
    <Box className={styles.container}>
      <Button variant="contained" color="primary">
        <PhotoCameraIcon sx={{ fontSize: "48px" }} />
      </Button>
      <br />
      {state.showHint && (
        <span style={{ color: hintColor }}>
          {state.content?.[lang]?.hint || ""}
        </span>
      )}
    </Box>
  );
}

export default React.memo(PhotoCaptureDesign);
