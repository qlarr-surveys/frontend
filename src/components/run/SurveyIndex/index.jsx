import React from "react";

import styles from "./SurveyIndex.module.css";
import { Card } from "@mui/material";
import { Box } from "@mui/system";
import { stripTags } from "~/utils/design/utils";
import { shallowEqual, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import { jump } from "~/state/runState";
import { questionIconByType } from "~/components/Questions/utils";

function SurveyIndex(props) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const relevance_map = useSelector((state) => {
    return state.runState.values["Survey"].relevance_map;
  }, shallowEqual);

  const validity_map = useSelector((state) => {
    return state.runState.values["Survey"].validity_map;
  }, shallowEqual);

  const canJump = useSelector((state) => {
    return state.runState.data.survey.allowJump;
  }, shallowEqual);

  const isCurrentGroup = (groupCode) => {
    return (
      props.navigationIndex.name == "group" &&
      groupCode == props.navigationIndex.groupId
    );
  };

  const isCurrentQuestion = (questionCode) => {
    return (
      props.navigationIndex.name == "question" &&
      questionCode == props.navigationIndex.questionId
    );
  };

  const isGroupClickable = (groupCode) =>
    canJump &&
    !isCurrentGroup(groupCode) &&
    props.navigationIndex.name == "group";

  const isQuestionClickable = (questionCode) =>
    canJump &&
    !isCurrentQuestion(questionCode) &&
    props.navigationIndex.name == "question";

  const onGroupClicked = (groupCode) => {
    if (isGroupClickable(groupCode)) {
      dispatch(jump({ ...props.navigationIndex, groupId: groupCode }));
    }
  };

  const onQuestionClicked = (questionCode) => {
    if (isQuestionClickable(questionCode)) {
      dispatch(jump({ ...props.navigationIndex, questionId: questionCode }));
    }
  };

  return (
    <>
      {props.survey && props.survey.groups
        ? props.survey.groups
            .filter(
              (group) => relevance_map[group.code] && group.groupType != "END"
            )
            .map((group) => {
              return (
                <Card
                  onClick={() => onGroupClicked(group.code)}
                  key={group.code}
                  className={styles.groupCard}
                  style={{
                    backgroundColor: isCurrentGroup(group.code)
                      ? "beige"
                      : theme.palette.background.paper,
                    cursor: isGroupClickable(group.code)
                      ? "pointer"
                      : "default",
                  }}
                >
                  <Box className={styles.groupTitle}>
                    {stripTags(group.content?.label)}{" "}
                  </Box>
                  {group.questions
                    .filter((question) => relevance_map[question.code])
                    .map((question) => {
                      return (
                        <Box
                          key={question.code}
                          onClick={() => onQuestionClicked(question.code)}
                          className={styles.questionTitle}
                          style={{
                            backgroundColor: isCurrentQuestion(question.code)
                              ? "beige"
                              : "inherit",
                            cursor: isGroupClickable(group.code)
                              ? "inherit"
                              : isQuestionClickable(group.code)
                              ? "pointer"
                              : "default",
                          }}
                        >
                          <span className={styles.questionIcon}>
                            {questionIconByType(question.type)}
                          </span>

                          <span className={styles.truncatedTwoLines}>
                            {stripTags(question.content?.label)}
                          </span>
                          {!validity_map[question.code] && (
                            <span className={styles.redAsterix}>*</span>
                          )}
                        </Box>
                      );
                    })}
                </Card>
              );
            })
        : ""}
    </>
  );
}

export default SurveyIndex;
