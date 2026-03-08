import { AddOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Typography } from "@mui/material";
import React from "react";
import { useCustomValidationRules } from "./useCustomValidationRules";
import RuleCard from "./RuleCard";

function CustomValidationRules({ code, t }) {
  const {
    customRules,
    languagesList,
    validateRuleIdSuffix,
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
        customRules.map((rule, ruleIndex) => (
          <RuleCard
            key={rule.code}
            rule={rule}
            ruleIndex={ruleIndex}
            languagesList={languagesList}
            t={t}
            validateRuleIdSuffix={validateRuleIdSuffix}
            onRemoveRule={onRemoveRule}
            onRuleChange={onRuleChange}
            onRuleIdChange={onRuleIdChange}
            onErrorMessageChange={onErrorMessageChange}
          />
        ))
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
