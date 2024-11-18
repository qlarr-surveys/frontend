import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Box, IconButton } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Menu as MenuIcon,
  ArrowBack,
  Shortcut,
} from "@mui/icons-material";
import { stripTags, truncateWithEllipsis } from "~/utils/design/utils";
import { jump } from "~/state/runState";
import styles from "./SurveyIndex.module.css";
import { useTheme } from "@mui/material";
import {
  groupIconByType,
  questionIconByType,
} from "~/components/Questions/utils";

function SurveyIndex() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);

  const survey = useSelector((state) => {
    return state.runState.data?.survey;
  }, shallowEqual);

  const [expandedGroups, setExpandedGroups] = useState({});
  const [isIndexOpen, setIsIndexOpen] = useState(false);

  const relevance_map = useSelector(
    (state) => state.runState.values["Survey"].relevance_map,
    shallowEqual
  );
  const canJump = useSelector(
    (state) => state.runState.data.survey.allowJump,
    shallowEqual
  );

  const isCurrentQuestion = (questionCode) =>
    navigationIndex.name === "question" &&
    questionCode === navigationIndex.questionId;
  const isQuestionClickable = (questionCode) =>
    canJump &&
    !isCurrentQuestion(questionCode) &&
    navigationIndex.name === "question";

  const onQuestionClicked = (questionCode) => {
    if (isQuestionClickable(questionCode)) {
      dispatch(jump({ ...navigationIndex, questionId: questionCode }));
    }
  };

  const isCurrentGroup = (groupCode) => {
    if (navigationIndex.name === "group") {
      return groupCode === navigationIndex.groupId;
    }
    if (navigationIndex.name === "question") {
      const currentGroup = survey.groups.find((group) =>
        group.questions.some(
          (question) => question.code === navigationIndex.questionId
        )
      );
      return currentGroup?.code === groupCode;
    }
    return false;
  };

  const isGroupClickable = (groupCode) =>
    canJump && !isCurrentGroup(groupCode) && navigationIndex.name == "group";

  const onGroupClicked = (groupCode) => {
    if (isGroupClickable(groupCode)) {
      dispatch(jump({ ...navigationIndex, groupId: groupCode }));
    }
  };
  const toggleGroupExpansion = (e, index) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleIndexVisibility = () => {
    setIsIndexOpen((prev) => !prev);
  };

  const validity_map = useSelector((state) => {
    return state.runState.values["Survey"].validity_map;
  }, shallowEqual);

  useEffect(() => {
    if (navigationIndex.name === "question") {
      const currentGroup = survey.groups.find((group) =>
        group.questions.some(
          (question) => question.code === navigationIndex.questionId
        )
      );
      if (currentGroup) {
        const currentGroupIndex = survey.groups.indexOf(currentGroup);
        setExpandedGroups({ ...expandedGroups, [currentGroupIndex]: true });
      }
    } else if (navigationIndex.name === "group") {
      const currentGroupIndex = survey.groups.findIndex(
        (group) => group.code === navigationIndex.groupId
      );
      if (currentGroupIndex !== -1) {
        setExpandedGroups({ ...expandedGroups, [currentGroupIndex]: true });
      }
    }
  }, [navigationIndex, survey.groups]);
  if (navigationIndex.name == "groups") return <></>;
  return (
    <>
      {!isIndexOpen && (
        <IconButton
          className={`${styles.menuIcon} ${styles.slideInLeft}`}
          onClick={toggleIndexVisibility}
          aria-label="open index"
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}
      {isIndexOpen && (
        <div
          style={{ backgroundColor: theme.palette.background.paper }}
          className={`${styles.surveyContent} ${styles.slideInLeft}`}
        >
          <IconButton
            onClick={toggleIndexVisibility}
            sx={{ width: "fit-content" }}
            aria-label="close index"
          >
            <ArrowBack
              fontSize="small"
              sx={{ color: theme.textStyles.group.color, marginRight: "auto" }}
            />
          </IconButton>
          {survey.groups
            .filter(
              (group) => relevance_map[group.code] && group.groupType !== "END"
            )
            .map((group, groupIndex) => (
              <div key={group.code}>
                <div
                  className={styles.groupTitleContainer}
                  onClick={() => onGroupClicked(group.code)}
                >
                  <Box
                    className={`${styles.groupTitle} ${
                      isCurrentGroup(group.code) ? styles.boldText : ""
                    }`}
                  >
                    {groupIconByType(
                      `${group.groupType}`,
                      undefined,
                      theme.textStyles.group.color
                    )}
                    {truncateWithEllipsis(stripTags(group.content?.label), 30)}
                  </Box>
                  <div className={styles.actionsContainer}>
                    {navigationIndex.name == "group" &&
                      !isCurrentGroup(group.code) && (
                        <IconButton
                          className={styles.jumpIcon}
                          onClick={() => onGroupClicked(group.code)}
                        >
                          <Shortcut
                            fontSize="small"
                            sx={{ color: theme.textStyles.group.color }}
                          />
                        </IconButton>
                      )}
                    <IconButton
                      className={styles.expandIcon}
                      onClick={(e) => toggleGroupExpansion(e, groupIndex)}
                    >
                      {expandedGroups[groupIndex] ? (
                        <ExpandLessIcon
                          fontSize="small"
                          sx={{ color: theme.textStyles.group.color }}
                        />
                      ) : (
                        <ExpandMoreIcon
                          fontSize="small"
                          sx={{ color: theme.textStyles.group.color }}
                        />
                      )}
                    </IconButton>
                  </div>
                </div>
                {expandedGroups[groupIndex] && (
                  <div className={styles.questionContainer}>
                    {group.questions
                      .filter((question) => relevance_map[question.code])
                      .map((question, questionIndex) => (
                        <Box
                          key={question.code}
                          onClick={() =>
                            onQuestionClicked(
                              question.code,
                              groupIndex,
                              questionIndex
                            )
                          }
                          className={`
                                                        ${styles.questionText} 
                                                        ${
                                                          isCurrentQuestion(
                                                            question.code
                                                          )
                                                            ? styles.boldText
                                                            : ""
                                                        } 
                                                        ${
                                                          isCurrentGroup(
                                                            group.code
                                                          ) &&
                                                          navigationIndex.name !==
                                                            "question"
                                                            ? styles.boldText
                                                            : ""
                                                        }
                                                        `}
                          style={{
                            cursor: isQuestionClickable(question.code)
                              ? "pointer"
                              : "default",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            {questionIconByType(
                              `${question.type}`,
                              undefined,
                              theme.textStyles.group.color
                            )}
                            {truncateWithEllipsis(
                              stripTags(question.content?.label),
                              25
                            )}
                            {!validity_map[question.code] && (
                              <span className={styles.redAsterix}>*</span>
                            )}
                          </Box>
                          {navigationIndex.name == "question" &&
                            !isCurrentQuestion(question.code) && (
                              <IconButton className={styles.jumpIcon}>
                                <Shortcut
                                  sx={{ color: theme.textStyles.group.color }}
                                />
                              </IconButton>
                            )}
                        </Box>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}

export default SurveyIndex;
