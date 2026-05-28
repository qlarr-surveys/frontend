import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useMemo } from "react";
import { isDarkColor } from "~/components/Questions/utils";
import { useThemeContrast } from "~/components/Questions/useThemeContrast";

import styles from "./SignatureDesign.module.css";

function SignatureDesign() {
  const theme = useTheme();
  const paper = theme.palette.background.paper;
  // A soft frame for the pad — mild border, not the dark `onPaper` foreground.
  const { mildPaperBorder: borderColor } = useThemeContrast();
  // signature.png is dark ink on a transparent background. The pad takes the
  // survey's paper color so it tracks the theme; on a dark-papered theme the
  // ink is inverted to white so the signature stays legible against it.
  const darkPaper = useMemo(() => isDarkColor(paper), [paper]);
  return (
    <Box
      className={styles.signatureCanvas}
      sx={{ backgroundColor: "background.default" }}
    >
      <Box
        sx={{
          display: "inline-block",
          width: "80%",
          maxWidth: "500px",
          backgroundColor: paper,
          border: `1px solid ${borderColor}`,
          borderRadius: "4px",
        }}
      >
        <img
          src="/signature.png"
          style={{
            display: "block",
            width: "100%",
            height: "200px",
            filter: darkPaper ? "invert(1)" : undefined,
          }}
        />
      </Box>
    </Box>
  );
}

export default React.memo(SignatureDesign);
