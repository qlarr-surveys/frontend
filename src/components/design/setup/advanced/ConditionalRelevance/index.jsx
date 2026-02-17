import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import { useConditionalRelevance } from "./useConditionalRelevance";
import styles from "../shared.module.css";
import AddIcon from "@mui/icons-material/Add";

function ConditionalRelevance({ code, t }) {
  const { conditionalRelevance, onToggleActive, onTextChange, onAdd } =
    useConditionalRelevance(code);

  return (
    <>
      {!conditionalRelevance ? (
        <Box sx={{ my: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAdd}
            size="small"
          >
            {t("add_conditional_relevance")}
          </Button>
        </Box>
      ) : (
        <Box className={styles.instructionCard}>
          <Box className={styles.instructionHeader}>
            <Typography fontWeight={600}>conditional relevance</Typography>
            <Switch
              checked={conditionalRelevance.isActive || false}
              onChange={(e) => onToggleActive(e.target.checked)}
            />
          </Box>

          {conditionalRelevance.isActive && (
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              size="small"
              placeholder={t("conditional_relevance_text_placeholder")}
              value={conditionalRelevance.text || ""}
              onChange={(e) => onTextChange(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      )}
    </>
  );
}

export default ConditionalRelevance;
