import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { getContrastColor, isDarkColor } from "~/components/Questions/utils";

import styles from "./SignatureDesign.module.css";

function SignatureDesign() {
  const theme = useTheme();
  const borderColor =
    theme.contrast?.onPaper ||
    getContrastColor(theme.palette.background.paper);
  // signature.png is dark ink — track the survey's paper color, but keep the
  // pad light enough for the ink to stay visible on a dark-papered theme.
  const paper = theme.palette.background.paper;
  const padColor = isDarkColor(paper) ? getContrastColor(paper) : paper;
  return (
    <Box
      className={styles.signatureCanvas}
      sx={{ backgroundColor: "background.default" }}
    >
      <img
        src="/signature.png"
        style={{
          backgroundColor: padColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 4,
          width: "80%",
          maxWidth: "500px",
          height: "200px",
        }}
      />
    </Box>
  );
}

export default React.memo(SignatureDesign);
