import React from "react";
import Switch from "@mui/material/Switch";
import { Box, Typography } from "@mui/material";
import styles from "./ValidationSetupItem.module.css";
import ValidationSetupMessage from "~/components/design/setup/validation/ValidationSetupMessage";
import ValidationSetupValue from "~/components/design/setup/validation/ValidationSetupValue";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { changeValidationValue } from "~/state/design/designState";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function ValidationSetupItem({ rule, t, code }) {
  console.debug("ValidationSetupItem: " + code);

  const dispatch = useDispatch();
  const validationRule = useSelector((state) => {
    return state.designState[code]?.validation?.[rule];
  });

  const label = { inputProps: { "aria-label": "Switch validation" } };
  const isActive = validationRule?.isActive || false;

  const checkedValidationItem = (checked) => {
    dispatch(
      changeValidationValue({
        code,
        rule: rule,
        key: "isActive",
        value: checked,
      })
    );
  };

  return (
    <div>
      <div className={styles.title}>
        <div className={styles.label}>
          <CustomTooltip body={t(`tooltips.${rule}`)} />
          <Typography fontWeight={700}>{t(rule + "_title")}</Typography>
        </div>
        <Switch
          {...label}
          checked={isActive}
          onChange={(event) => checkedValidationItem(event.target.checked)}
        />
      </div>
      {isActive && (
        <Box className={styles.boxContainer}>
          <ValidationSetupValue
            code={code}
            validation={validationRule}
            rule={rule}
            t={t}
          />
          <ValidationSetupMessage
            code={code}
            validationRule={validationRule}
            rule={rule}
            t={t}
          />
        </Box>
      )}
    </div>
  );
}

export default React.memo(ValidationSetupItem);
