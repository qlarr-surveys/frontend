import React from "react";
import { useSelector, shallowEqual } from "react-redux";

import Question from "~/components/Question";
import Content from "~/components/run/Content";

import styles from "./Group.module.css";
import { Box, Divider, useTheme } from "@mui/material";

function Group(props) {
  const theme = useTheme();

  const showGroup = useSelector((state) => {
    let groupState = state.runState.values[props.group.code];
    return typeof groupState?.relevance === "undefined" || groupState.relevance;
  });

  const visibleQuestionCodes = useSelector((state) => {
    return (props.group?.questions ?? [])
      .filter((quest) => {
        if (!quest.inCurrentNavigation) return false;
        const q = state.runState.values[quest.qualifiedCode];
        return typeof q?.relevance === "undefined" || !!q?.relevance;
      })
      .map((q) => q.qualifiedCode);
  }, shallowEqual);

  const showGroup_ = () => {
    const visibleCodesSet = new Set(visibleQuestionCodes);
    const visibleQuestions = (props.group?.questions ?? []).filter((quest) =>
      visibleCodesSet.has(quest.qualifiedCode)
    );
    return (
      <>
        <Box
          data-code={props.group.code}
          className={styles.topLevel}
          sx={{
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(22, 32, 91, 0.08)",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div className={styles.groupHeader}>
            <Content
              elementCode={props.group.code}
              name="label"
              customStyle={`
        font-size: ${theme.textStyles.group.size}px;
        `}
              content={props.group.content?.label}
            />

            {props.group.showDescription &&
              props.group.content?.description && (
                <Box className={styles.textDescription}>
                  <Content
                    elementCode={props.group.code}
                    name="description"
                    customStyle={`
        font-size: ${theme.textStyles.text.size}px;
        `}
                    content={props.group.content?.description}
                  />
                </Box>
              )}
          </div>

          {visibleQuestions.map((quest, idx) => (
            <React.Fragment key={quest.code}>
              <Question component={quest} />
              {idx < visibleQuestions.length - 1 && (
                <Divider sx={{ mt: "12px", mb: "12px" }} />
              )}
            </React.Fragment>
          ))}
        </Box>
      </>
    );
  };
  return showGroup && (props.group ? showGroup_() : "");
}

export default React.memo(Group);
