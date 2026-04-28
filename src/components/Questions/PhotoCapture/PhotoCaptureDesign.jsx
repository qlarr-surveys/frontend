import { Box, IconButton } from "@mui/material";
import React from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import styles from "./PhotoCaptureDesign.module.css";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";

function PhotoCaptureDesign({ code }) {
  const theme = useTheme();

  const state = useSelector((state) => {
    return state.designState[code];
  });

  const lang = useSelector((state) => {
    return state.designState.langInfo.lang;
  });

  return (
    <Box className={styles.container}>
      <IconButton
        color="primary"
      >
        <PhotoCameraIcon sx={{ fontSize: "48px" }} />
      </IconButton>
      <br />
      {state.showHint && <span>{state.content?.[lang]?.hint || ""}</span>}
    </Box>
  );
}

export default React.memo(PhotoCaptureDesign);
