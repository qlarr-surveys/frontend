import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const MapDesign = ({ code, t }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        height: "300px",
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.grey[50],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          fontSize: "80px",
          color: theme.palette.primary.main,
        }}
      >
        📍
      </Box>
    </Box>
  );
};

export default MapDesign;