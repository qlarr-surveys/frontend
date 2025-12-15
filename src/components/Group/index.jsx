import React from "react";
import { useSelector, shallowEqual } from "react-redux";

import Question from "~/components/Question";
import Content from "~/components/run/Content";

import styles from "./Group.module.css";
import { Box, useTheme } from "@mui/material";

function Group(props) {
  const theme = useTheme();

  const state = useSelector((state) => {
    let groupState = state.runState.values[props.group.code];
    return {
      showGroup:
        typeof groupState?.relevance === "undefined" || groupState.relevance,
    };
  }, shallowEqual);

  const showGroup = () => {
    return (
      <>
        <Box
          className={styles.topLevel}
          sx={{
            border: `0.1px solid transparent`,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(22, 32, 91, 0.08)",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div className={styles.groupHeader}>
            <Content
              elementCode={props.group.code}
              name="label"
              lang={props.lang}
              fontFamily={theme.textStyles.group.font}
              color={theme.textStyles.group.color}
              fontSize={theme.textStyles.group.size}
              content={props.group.content?.label}
            />

            {props.group.showDescription &&
              props.group.content?.description && (
                <Box className={styles.textDescription}>
                  <Content
                    elementCode={props.group.code}
                    name="description"
                    lang={props.lang}
                    content={props.group.content?.description}
                  />
                </Box>
              )}
          </div>

          {props.group && props.group.questions
            ? props.group.questions
                .filter((quest) => quest.inCurrentNavigation)
                .map((quest) => (
                  <Question
                    key={quest.code}
                    component={quest}
                    lang={props.lang}
                  />
                ))
            : ""}
        </Box>
      </>
    );
  };
  return state.showGroup && (props.group ? showGroup() : "");
}

export default React.memo(Group);
