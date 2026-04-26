import { Box, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import { useOrderInstructions } from "./useOrderInstructions";
import styles from "../shared.module.css";

function OrderInstructions({ code, t }) {
  const { isActive, orderInstruction, errors, onToggle, onTextChange } = useOrderInstructions(code);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography fontWeight={700}>{t("order_instructions_title")}</Typography>
        <Switch
          checked={isActive}
          onChange={(e) => onToggle(e.target.checked)}
          inputProps={{ "aria-label": "order instructions" }}
        />
      </Box>
      {isActive && (
        <Box className={styles.instructionCard}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            size="small"
            placeholder={t("order_instruction_placeholder")}
            value={orderInstruction.text || ""}
            onChange={(e) => onTextChange(e.target.value)}
            error={errors.length > 0}
          />
          {errors.map((err, i) => (
            <Typography key={i} variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
              {err.message}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default OrderInstructions;
