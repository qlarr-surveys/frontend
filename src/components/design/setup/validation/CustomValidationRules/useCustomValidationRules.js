import { useDispatch, useSelector } from "react-redux";
import {
  addCustomValidationRule,
  updateCustomValidationRule,
  removeCustomValidationRule,
} from "~/state/design/designState";

export function useCustomValidationRules(code, t) {
  const dispatch = useDispatch();

  const customRules = useSelector((state) => {
    return state.designState[code]?.validation?.custom_rules || [];
  });

  const languagesList = useSelector((state) => {
    return state.designState.langInfo.languagesList;
  });

  const validateRuleIdSuffix = (suffix, currentIndex) => {
    if (!suffix) {
      return t("validation_id_required");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(suffix)) {
      return t("validation_id_invalid_chars");
    }
    const fullId = `validation_custom_${suffix}`;
    const isDuplicate = customRules.some(
      (rule, idx) => idx !== currentIndex && rule.id === fullId
    );
    if (isDuplicate) {
      return t("validation_id_duplicate");
    }
    return null;
  };

  const validateRuleCondition = (ruleText) => {
    if (!ruleText || ruleText.trim() === "") {
      return t("rule_condition_required");
    }
    return null;
  };

  const onAddRule = () => {
    dispatch(addCustomValidationRule({ code }));
  };

  const onRemoveRule = (ruleIndex) => {
    dispatch(removeCustomValidationRule({ code, ruleIndex }));
  };

  const onRuleChange = (ruleIndex, newRule) => {
    dispatch(
      updateCustomValidationRule({
        code,
        ruleIndex,
        updates: { rule: newRule },
      })
    );
  };

  const onRuleIdChange = (ruleIndex, newSuffix) => {
    const newId = `validation_custom_${newSuffix}`;
    dispatch(
      updateCustomValidationRule({
        code,
        ruleIndex,
        updates: { id: newId },
      })
    );
  };

  const onErrorMessageChange = (ruleIndex, lang, value) => {
    dispatch(
      updateCustomValidationRule({
        code,
        ruleIndex,
        updates: {
          errorMessages: {
            ...customRules[ruleIndex].errorMessages,
            [lang]: value,
          },
        },
      })
    );
  };

  return {
    customRules,
    languagesList,
    validateRuleIdSuffix,
    validateRuleCondition,
    onAddRule,
    onRemoveRule,
    onRuleChange,
    onRuleIdChange,
    onErrorMessageChange,
  };
}
