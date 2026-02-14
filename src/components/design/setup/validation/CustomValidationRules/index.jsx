import { AddOutlined, DeleteOutline } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useCustomValidationRules } from "./useCustomValidationRules";
import styles from "./CustomValidationRules.module.css";

function CustomValidationRules({ code, t }) {
  const {
    customRules,
    languagesList,
    validateRuleIdSuffix,
    validateRuleCondition,
    onAddRule,
    onRemoveRule,
    onRuleChange,
    onRuleIdChange,
    onErrorMessageChange,
  } = useCustomValidationRules(code, t);

  return (
    <>
      <Typography fontWeight={700} sx={{ mt: 3 }}>
        {t("custom_validation_rules")}
      </Typography>
      <Divider sx={{ my: 1 }} />

      {customRules.length === 0 ? (
        <Typography color="text.secondary" sx={{ my: 2 }}>
          {t("no_custom_validation_rules")}
        </Typography>
      ) : (
        customRules.map((rule, ruleIndex) => {
          const idSuffix = rule.id?.replace(/^validation_custom_/, "") || "";
          const idError = validateRuleIdSuffix(idSuffix, ruleIndex);
          const conditionError = validateRuleCondition(rule.rule);

          return (
            <Box key={ruleIndex} className={styles.ruleCard}>
              <Box className={styles.ruleHeader}>
                <Typography fontWeight={600}>
                  {t("custom_rule")} #{ruleIndex + 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onRemoveRule(ruleIndex)}
                  color="error"
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {t("validation_rule_id")}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="custom_rule"
                  value={idSuffix}
                  onChange={(e) => onRuleIdChange(ruleIndex, e.target.value)}
                  error={!!idError}
                  helperText={idError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          component="span"
                          sx={{ color: "text.secondary", fontWeight: 500 }}
                        >
                          validation_custom_
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {t("rule_condition")}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  placeholder={t("enter_validation_rule")}
                  value={rule.rule || ""}
                  onChange={(e) => onRuleChange(ruleIndex, e.target.value)}
                  error={!!conditionError}
                  helperText={conditionError}
                />
              </Box>

              <Typography fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                {t("error_messages")}
              </Typography>

              <Box className={styles.errorWrapper}>
                <Box className={styles.errorLabelWrapper}>
                  {languagesList.map((l) => (
                    <Box
                      key={l.code}
                      className={`${styles.errorItem} ${styles.uppercase}`}
                    >
                      {l.code}:
                    </Box>
                  ))}
                </Box>
                <Box className={styles.errorItemContainer}>
                  {languagesList.map((l) => (
                    <Box key={l.code} className={styles.errorItem}>
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        placeholder={t("error_message")}
                        value={rule.errorMessages?.[l.code] || ""}
                        onChange={(e) =>
                          onErrorMessageChange(
                            ruleIndex,
                            l.code,
                            e.target.value
                          )
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          );
        })
      )}

      <Button
        variant="outlined"
        startIcon={<AddOutlined />}
        onClick={onAddRule}
        sx={{ mt: 2 }}
        fullWidth
      >
        {t("add_custom_validation_rule")}
      </Button>
    </>
  );
}

export default CustomValidationRules;
