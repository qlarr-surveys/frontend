import FieldSize from "~/components/design/setup/FieldSize";
import ShowHint, { ContentEditor } from "~/components/design/setup/ShowHint";
import ValidationSetupItem from "~/components/design/setup/validation/ValidationSetupItem";
import React, { useCallback } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ToggleValue from "../ToggleValue";
import SelectValue from "../SelectValue";
import SelectDate from "../SelectDate";
import Relevance from "../logic/Relevance";
import SkipLogic from "../SkipLogic";
import styles from "./SetupPanel.module.css";
import CloseIcon from "@mui/icons-material/Close";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { resetSetup, setupToggleExpand } from "~/state/design/designState";
import OrderPrioritySetup from "../random/OrderPrioritySetup";
import { NavigationMode } from "~/components/manage/NavigationMode";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import Theming from "../Theming";
import { ManageLanguages } from "~/pages/manage/ManageTranslations";
import { useTheme } from "@emotion/react";
import { hasMajorSetup } from "~/constants/design";

function SetupPanel({ t }) {
  const dispatch = useDispatch();
  const toggleExpand = useCallback((key) => {
    dispatch(setupToggleExpand(key));
  });

  const theme = useTheme();

  const selectSetupInfo = (state) => state.designState.setup || {};
  const selectSetupData = createSelector([selectSetupInfo], (setupInfo) => ({
    code: setupInfo.code,
    expanded: setupInfo.expanded,
    highlighted: setupInfo.highlighted,
    rules: setupInfo.rules,
    isSingleRule: setupInfo.rules?.length === 1,
  }));

  const { code, expanded, highlighted, rules, isSingleRule } =
    useSelector(selectSetupData);

  return (
    <div
      className={styles.rightContent}
      style={{
        left: theme.direction == "rtl" ? "0px" : "",
      }}
    >
      <div className={styles.close}>
        <IconButton
          onClick={() => {
            dispatch(resetSetup());
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      {rules?.map((rule) => (
        <SetupSection
          expanded={expanded?.includes(rule.key) || isSingleRule || false}
          isSingleRule={isSingleRule}
          code={code}
          t={t}
          toggleExpand={toggleExpand}
          key={code + rule.title}
          highlighted={rule.key == highlighted}
          rule={rule}
        />
      ))}
    </div>
  );
}

export default React.memo(SetupPanel);

const SetupComponent = React.memo(({ code, rule, t }) => {
  if (rule.startsWith("validation_")) {
    return (
      <ValidationSetupItem t={t} rule={rule} key={code + rule} code={code} />
    );
  }

  switch (rule) {
    case "theme":
      return <Theming t={t} key={code + rule} />;
    case "language":
      return <ManageLanguages t={t} key={code + rule} />;
    case "maxChars":
      return (
        <FieldSize
          label={t("text_field_size")}
          rule={rule}
          lowerBound={1}
          upperBound={500}
          defaultValue={20}
          code={code}
          key={code + rule}
        />
      );
    case "minRows":
      return (
        <FieldSize
          label={t("textarea_lines")}
          lowerBound={1}
          upperBound={500}
          code={code}
          defaultValue={20}
          key={code + rule}
        />
      );
    case "hideText":
      return (
        <ToggleValue
          key={code + rule}
          label={t("hide_text")}
          rule={rule}
          code={code}
        />
      );
    case "showDescription":
      return (
        <ToggleValue
          key={code + rule}
          label={t("show_description")}
          rule={rule}
          code={code}
        />
      );
    case "showWordCount":
      return (
        <ToggleValue
          key={code + rule}
          label={t("show_word_count")}
          rule={rule}
          code={code}
        />
      );
    case "navigationMode":
      return <NavigationMode key={code + rule} />;
    case "allowPrevious":
      return (
        <ToggleValue
          key={code + rule}
          label={t("allow_previous")}
          rule={rule}
          code={code}
        />
      );
    case "allowIncomplete":
      return (
        <ToggleValue
          key={code + rule}
          label={t("allow_incomplete")}
          rule={rule}
          code={code}
        />
      );
    case "allowJump":
      return (
        <ToggleValue
          key={code + rule}
          label={t("allow_jump")}
          rule={rule}
          code={code}
        />
      );
    case "skipInvalid":
      return (
        <ToggleValue
          key={code + rule}
          label={t("skip_invalid")}
          rule={rule}
          code={code}
        />
      );
    case "hint":
      return <ShowHint t={t} key={code + rule} code={code} />;
    case "lower_bound_hint":
      return (
        <ContentEditor
          title={t("lower_bound_hint")}
          objectName="lower_bound_hint"
          key={code + rule}
          code={code}
        />
      );
    case "higher_bound_hint":
      return (
        <ContentEditor
          title={t("upper_bound_hint")}
          objectName="higher_bound_hint"
          key={code + rule}
          code={code}
        />
      );

    case "loop":
      return (
        <ToggleValue
          key={code + rule}
          rule={rule}
          code={code}
          label={t("loop_video")}
        />
      );
    case "audio_only":
      return (
        <ToggleValue
          key={code + rule}
          rule={rule}
          code={code}
          label={t("audio_only")}
        />
      );
    case "fullDayFormat":
      return (
        <ToggleValue
          key={code + rule}
          rule={rule}
          code={code}
          label={t("fullday_format")}
        />
      );
    case "randomize_questions":
    case "prioritize_questions":
    case "randomize_options":
    case "prioritize_options":
    case "randomize_groups":
    case "prioritize_groups":
    case "randomize_rows":
    case "prioritize_rows":
    case "randomize_columns":
    case "prioritize_columns":
      return (
        <OrderPrioritySetup t={t} key={code + rule} rule={rule} code={code} />
      );
    case "maxDate":
      return (
        <SelectDate
          lowerBound={1}
          code={code}
          key={code + rule}
          label={t("max_date")}
          rule={rule}
        />
      );
    case "minDate":
      return (
        <SelectDate
          key={code + rule}
          label={t("min_date")}
          rule={rule}
          code={code}
        />
      );
    case "dateFormat":
      const listDateFormat = [
        "DD.MM.YYYY",
        "MM.DD.YYYY",
        "YYYY.MM.DD",
        "DD/MM/YYYY",
        "MM/DD/YYYY",
        "YYYY/MM/DD",
      ];
      return (
        <SelectValue
          values={listDateFormat}
          key={code + rule}
          defaultValue="DD.MM.YYYY"
          label={t("date_format")}
          rule={rule}
          code={code}
        />
      );
    case "decimal_separator":
      const decimalValues = ["", ",", "."];
      const labels = [t("no_decimals_allowed"), ",", "."];
      return (
        <SelectValue
          values={decimalValues}
          labels={labels}
          key={code + rule}
          defaultValue=""
          label={t("decimal_separator")}
          rule={rule}
          code={code}
        />
      );
    case "imageAspectRatio":
      const aspectLabels = ["1:1", "16:9", "4:3", "3:2", "9:16", "3:4", "2:3"];
      const aspectValues = [1, 1.7778, 1.3333, 1.5, 0.562, 0.75, 0.6667];
      return (
        <SelectValue
          values={aspectValues}
          labels={aspectLabels}
          key={code + rule}
          defaultValue="1:1"
          label={t("image_aspect_ratio")}
          rule={rule}
          code={code}
        />
      );
    case "reorder_setup":
      const reorderLabels = [
        t("collapse_groups"),
        t("collapse_questions"),
      ];
      const reorderValues = [
        "collapse_groups",
        "collapse_questions",
      ];
      return (
        <SelectValue
          values={reorderValues}
          key={code + rule}
          labels={reorderLabels}
          defaultValue="collapse_none"
          label={t("order_mode")}
          rule={rule}
          code={code}
        />
      );
    case "iconSize":
      const iconSizes = ["50", "100", "150", "200"];
      return (
        <SelectValue
          values={iconSizes}
          key={code + rule}
          defaultValue="1:1"
          label={t("image_icon_size")}
          rule={rule}
          code={code}
        />
      );
    case "columns":
      const columnsOptions = ["1", "2", "3", "4", "6"];
      return (
        <SelectValue
          values={columnsOptions}
          key={code + rule}
          defaultValue="2"
          label={t("columns_number")}
          rule={rule}
          code={code}
        />
      );
    case "imageHeight":
      return (
        <FieldSize
          label={t("image_height")}
          lowerBound={50}
          upperBound={500}
          code={code}
          defaultValue={250}
          rule={rule}
          key={code + rule}
        />
      );

    case "spacing":
      return (
        <FieldSize
          label={t("spacing")}
          lowerBound={2}
          upperBound={32}
          code={code}
          defaultValue={8}
          rule={rule}
          key={code + rule}
        />
      );
    case "skip_logic":
      return <SkipLogic t={t} key={code + rule} code={code} />;
    case "relevance":
      return <Relevance t={t} key={code + rule} code={code} />;
    default:
      return "";
  }
});

const SetupSection = React.memo(
  ({ expanded, highlighted, code, rule, isSingleRule, t, toggleExpand }) => {
    return (
      <Accordion
        expanded={expanded}
        className={styles.accordionStyle}
        TransitionProps={{ unmountOnExit: true }}
      >
        <AccordionSummary
          onClick={() => toggleExpand(rule.key)}
          className={styles.setupHeader}
          expandIcon={isSingleRule ? null : <ExpandMoreIcon />}
        >
          <span className={styles.sectionTitle}>{t(rule.title)}</span>
        </AccordionSummary>
        <AccordionDetails
          sx={{ backgroundColor: highlighted ? "#fff" : "background.paper" }}
        >
          {rule.rules.map((el) => (
            <SetupComponent code={code} rule={el} t={t} key={el} />
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }
);
