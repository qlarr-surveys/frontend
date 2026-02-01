// components/design/setup/logic/Relevance.tsx
import { Switch, Button, Divider, Typography } from "@mui/material";
import { QlarrLogicBuilderInlineWrapper } from "~/components/design/setup/logic/QlarrLogicBuilder";
import { changeRelevance } from "~/state/design/designState";
import React, { useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Relevance.module.css";
import { Trans, useTranslation } from "react-i18next";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";

function Relevance({ code, t }) {
  const dispatch = useDispatch();
  const { t: tTooltips } = useTranslation(NAMESPACES.DESIGN_TOOLTIPS);
  const { t: tCore } = useTranslation(NAMESPACES.DESIGN_CORE);

  const designState = useSelector((s) => s.designState);
  const state = designState[code];
  const componentIndex = designState.componentIndex;
  const langInfo = designState.langInfo;
  const mainLang = langInfo?.mainLang;
  const langList = useMemo(
    () => langInfo?.languagesList?.map((lang) => lang.code) || [],
    [langInfo?.languagesList]
  );

  const instruction = state?.instructionList?.find(
    (i) => i.code === "conditional_relevance"
  );
  const errors = instruction?.errors || [];
  const hasErrors = errors.length > 0;

  const rule = state?.relevance?.rule ?? "show_always";
  const logic = state?.relevance?.logic;

  // Disabled behaves like "hide_always" → this UI should disappear
  const isDisabled = rule === "hide_always";

  // our single toggle = "Use condition to show"
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
      setRelevance({ rule: "show_if", logic: logic || null });
    } else {
      setRelevance({ rule: "show_always", logic: undefined });
    }
  };

  const onLogicChange = useCallback(({ jsonLogic }) => {
    setRelevance({ rule: "show_if", logic: jsonLogic });
  }, [setRelevance]);

  const resetToShowAlways = () =>
    setRelevance({ rule: "show_always", logic: undefined });


  return (
    <div className={`${hasErrors ? styles.relevanceError : ""}`}>
      <div className={styles.toggleValue}>
        <div className={styles.label}>
          <CustomTooltip body={tTooltips("relevance")} />
          <Typography color={isDisabled && 'text.disabled'} fontWeight={700}>{t("relevance")}</Typography>
        </div>
        <Switch
          id="conditional-visibility-switch"
          disabled={isDisabled}
          checked={conditionOn}
          onChange={(e) => handleToggle(e.target.checked)}
          inputProps={{ "aria-label": "conditional-visibility-switch" }}
        />
      </div>

      {hasErrors ? (
        <div className={styles.errorContainer}>
          <Trans t={t} i18nKey="wrong_logic_err" />
          <Button variant="contained" onClick={resetToShowAlways}>
            OK
          </Button>
        </div>
      ) : conditionOn ? (
        <>
          <Divider sx={{ my: 1 }} />
          <QlarrLogicBuilderInlineWrapper
            code={code}
            jsonLogic={logic}
            onChange={onLogicChange}
            componentIndices={componentIndex}
            designState={designState}
            mainLang={mainLang}
            langList={langList}
            t={tCore}
          />
        </>
      ) : null}
    </div>
  );
}
export default Relevance;
