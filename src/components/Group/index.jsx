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
          data-code={props.group.code}
          className={styles.topLevel}
          sx={{
            borderRadius: "4px",

            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div className={styles.groupHeader}>
            <Content
              elementCode={props.group.code}
              name="label"
              lang={props.lang}
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
