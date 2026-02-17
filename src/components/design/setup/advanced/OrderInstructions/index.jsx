import { Box, TextField, Typography } from "@mui/material";
import React from "react";
import { useOrderInstructions } from "./useOrderInstructions";
import styles from "../shared.module.css";

function OrderInstructions({ code, t }) {
  const { orderInstruction, onTextChange } = useOrderInstructions(code);

  if (!orderInstruction) {
    return null;
  }

  return (
    <Box className={styles.instructionCard}>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
        {orderInstruction.code}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        size="small"
        placeholder={t("order_instruction_placeholder")}
        value={orderInstruction.text || ""}
        onChange={(e) => onTextChange(e.target.value)}
      />
    </Box>
  );
}

export default OrderInstructions;
