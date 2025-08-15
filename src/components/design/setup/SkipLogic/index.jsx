import { ErrorOutlineOutlined } from "@mui/icons-material";
import { Button, FormControl, MenuItem, Select, Switch } from "@mui/material";
import { Box } from "@mui/material";
import { jumpDestinations } from "~/utils/design/access/jumpDestinations";
import {
  editDisqualifyToEnd,
  editSkipDestination,
  editSkipToEnd,
  removeSkipDestination,
} from "~/state/design/designState";
import React, { useMemo } from "react";
import { Trans } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import styles from "./SkipLogic.module.css";

function SkipLogic({ code, t }) {
  const dispatch = useDispatch();

  const skipLogic = useSelector((state) => {
    return state.designState[code].skip_logic || {};
  });

  const componentIndex = useSelector((state) => state.designState.componentIndex);
  const mainLang = useSelector((state) => state.designState.langInfo.mainLang);
  const designState = useSelector((state) => state.designState);

  const destinations = useMemo(() => {
    return jumpDestinations(componentIndex, code, designState, mainLang);
  }, [componentIndex, code, designState, mainLang]);

  const instructions = useSelector((state) => {
    return state.designState[code].instructionList.filter((el) =>
      el.code.startsWith("skip_to")
    );
  });

  const lang = useSelector((state) => state.designState.langInfo.lang);
  const codeData = useSelector((state) => state.designState[code]);

  const children = useMemo(() => {
    return codeData?.children?.map((child) => {
      return {
        code: child.code,
        label:
          designState[child.qualifiedCode].content?.[lang]?.label ||
          child.code,
      };
    });
  }, [codeData, designState, lang]);

  const onChange = (answerCode, targetCode) => {
    if (targetCode == "proceed") {
      dispatch(removeSkipDestination({ code, answerCode }));
    } else {
      dispatch(editSkipDestination({ code, answerCode, skipTo: targetCode }));
    }
  };

  const onToEndChanged = (answerCode, checked) => {
    dispatch(editSkipToEnd({ code, answerCode, toEnd: checked }));
  };

  const onDisqualifyChanged = (answerCode, checked) => {
    dispatch(editDisqualifyToEnd({ code, answerCode, disqualify: checked }));
  };

  return (
    <>
      {children?.map((element) => {
        const code = element.code;
        const original = skipLogic?.[code];
        const skipTo = original?.skipTo;
        const skipToCode = skipTo || "proceed";
        const invalidSkipDestination =
          skipTo &&
          instructions
            ?.find((el) => el.code == "skip_to_on_" + code)
            ?.errors?.find((el) => el.name == "InvalidSkipReference");
        return (
          <div key={element.code} className={styles.skipItem}>
            <Trans
              t={t}
              values={{ code: element.label }}
              i18nKey="if_answer_is"
            />
            {invalidSkipDestination
              ? skipValueError(code, skipTo, onChange, t)
              : skipSelectValue(
                  code,
                  destinations,
                  skipToCode,
                  original?.toEnd,
                  onChange,
                  onToEndChanged,
                  onDisqualifyChanged,
                  original?.disqualify,
                  t
                )}
          </div>
        );
      })}
    </>
  );
}

function skipValueError(answerCode, skipToCode, onChange, t) {
  return (
    <Box className={styles.errorDisplay}>
      <ErrorOutlineOutlined style={{ verticalAlign: "middle" }} />{" "}
      <Trans
        t={t}
        values={{ code: skipToCode }}
        i18nKey="invalid_skip_destination_err"
      />
      <Button
        variant="contained"
        onClick={() => onChange(answerCode, "proceed")}
      >
        {t("ok")}
      </Button>
    </Box>
  );
}

function skipSelectValue(
  answerCode,
  destinations,
  skipToCode,
  toEnd,
  onChange,
  onToEndChanged,
  onDisqualifyChanged,
  disqualified,
  t
) {
  return (
    <>
      <FormControl variant="standard" fullWidth>
        <Select
          id="skip-action"
          value={skipToCode}
          label={t("skip_to")}
          onChange={(e) => onChange(answerCode, e.target.value)}
        >
          <MenuItem key="proceed" value="proceed">
            {t("proceed_as_usual")}
          </MenuItem>
          {destinations &&
            destinations?.map((element) => {
              return (
                <MenuItem key={element.code} value={element.code}>
                  {element.label}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
      {skipToCode && skipToCode.startsWith("G") && (
        <Box>
          <div className={styles.toEnd}>
            <h4>{t("to_group_end")}</h4>
            <Switch
              disabled
              checked={toEnd || false}
              onChange={(event) =>
                onToEndChanged(answerCode, event.target.checked)
              }
            />
          </div>
          <div className={styles.toEnd}>
            <h4>{t("disqualify")}</h4>
            <Switch
              checked={disqualified || false}
              onChange={(event) =>
                onDisqualifyChanged(answerCode, event.target.checked)
              }
            />
          </div>
        </Box>
      )}
    </>
  );
}

export default SkipLogic;
