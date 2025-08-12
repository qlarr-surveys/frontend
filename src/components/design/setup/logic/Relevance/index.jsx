// components/design/setup/logic/Relevance.tsx
import { FormControlLabel, Switch, Button } from "@mui/material";
import LogicBuilder from "~/components/design/setup/logic/LogicBuilder";
import { changeRelevance } from "~/state/design/designState";
import React, { useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Relevance.module.css";
import { Trans } from "react-i18next";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function Relevance({ code, t }) {
  const dispatch = useDispatch();
  const [logicDialogOpen, setLogicDialogOpen] = useState(false);

  const state = useSelector((s) => s.designState[code]);
  const instruction = state?.instructionList?.find(
    (i) => i.code === "conditional_relevance"
  );
  const errors = instruction?.errors || [];
  const hasErrors = errors.length > 0;

  const rule = state?.relevance?.rule ?? "show_always";
  const logic = state?.relevance?.logic;

  // Disabled behaves like "hide_always" → this UI should disappear
  const isDisabled = rule === "hide_always";

  // our single toggle = “Use condition to show”
  const conditionOn = useMemo(() => rule === "show_if", [rule]);

  const setRelevance = useCallback(
    (next) => {
      dispatch(
        changeRelevance({
          code,
          key: "relevance",
          value: { rule: next.rule, logic: next.logic },
        })
      );
    },
    [code, dispatch]
  );

  const handleToggle = (checked) => {
    if (checked) {
      if (!logic) {
        setLogicDialogOpen(true);
        return;
      }
      setRelevance({ rule: "show_if", logic });
    } else {
      setRelevance({ rule: "show_always", logic: undefined });
    }
  };

  const onLogicChange = (newLogic) => {
    setLogicDialogOpen(false);
    setRelevance({ rule: "show_if", logic: newLogic });
  };

  const resetToShowAlways = () =>
    setRelevance({ rule: "show_always", logic: undefined });

  if (isDisabled) return null;
  const shouldHaveLogic = conditionOn || logicDialogOpen;


  return (
    <div className={`${hasErrors ? styles.relevanceError : ""}`}>
      <div className={styles.toggleValue}>
        <div className={styles.label}>
          <CustomTooltip body={t("tooltips.relevance")} />
          <h4>{t("relevance")}</h4>
        </div>
        <Switch
          id="conditional-visibility-switch"
          checked={conditionOn || logicDialogOpen}
          onChange={(e) => handleToggle(e.target.checked)}
          inputProps={{ "aria-label": "conditional-visibility-switch" }}
        />
      </div>

      {!hasErrors && shouldHaveLogic && (
        <LogicBuilder
          title={t("condition_to_show")}
          code={code}
          onChange={onLogicChange}
          onDialogStateChanged={setLogicDialogOpen}
          t={t}
          dialogOpen={logicDialogOpen}
          logic={logic}
        />
      )}

      {hasErrors && !logicDialogOpen ? (
        <div className={styles.errorContainer}>
          <Trans t={t} i18nKey="wrong_logic_err" />
          <Button variant="contained" onClick={resetToShowAlways}>
            OK
          </Button>
        </div>
      ) : null}

      {shouldHaveLogic && !logicDialogOpen && !logic ? (
        <div>
          <Trans t={t} i18nKey="no_logic_err" />
        </div>
      ) : null}
    </div>
  );
}
export default Relevance;
