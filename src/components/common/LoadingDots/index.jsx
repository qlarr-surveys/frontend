import React from "react";
import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import styles from "./LoadingDots.module.css";

const LoadingDots = () => {
  const theme = useTheme();
  return (
    <Box className={styles.loadingWrapper}>
      <Box
        style={{
          background: `radial-gradient(circle closest-side, ${theme?.palette?.primary?.main} 90%, #0000) 0 / calc(100% / 3) 100% space`,
        }}
        className={styles.loadingDots}
      ></Box>
    </Box>
  );
}

export default LoadingDots;
