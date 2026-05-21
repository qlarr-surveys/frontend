import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useMemo } from "react";
import VideocamIcon from "@mui/icons-material/Videocam";
import {
  getForegroundColor,
  getThemedButtonSx,
} from "~/components/Questions/utils";

import styles from "./VideoCaptureDesign.module.css";
import { useSelector } from "react-redux";

function VideoCaptureDesign({ code }) {
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
  const buttonSx = useMemo(() => getThemedButtonSx(theme), [theme]);

  return (
    <Box className={styles.container}>
      <Button variant="outlined" sx={buttonSx}>
        <VideocamIcon sx={{ fontSize: "48px" }} />
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

export default React.memo(VideoCaptureDesign);
