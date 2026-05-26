import React from "react";

import styles from "./SurveyIndex.module.css";
import { stripTags } from "~/utils/design/utils";
import { shallowEqual, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import { jump } from "~/state/runState";
import {
  questionIconByType,
  getForegroundColor,
} from "~/components/Questions/utils";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import { getClosestScrollableParent } from "~/components/run/Navigation";

function SurveyIndex(props) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const iconColor =
    theme.contrast?.onPaper ||
    getForegroundColor(theme.palette.background.paper);

  const relevance_map = useSelector((state) => {
    return state.runState.values["Survey"].relevance_map;
  }, shallowEqual);

  const validity_map = useSelector((state) => {
    return state.runState.values["Survey"].validity_map;
  }, shallowEqual);

  const answeredSet = useSelector((state) => {
    const set = new Set();
    const values = state.runState.values;
    for (const code in values) {
      if (code === "Survey") continue;
      if (values[code]?.value !== undefined) set.add(code);
    }
    return set;
  }, (a, b) => {
    if (a.size !== b.size) return false;
    for (const code of a) if (!b.has(code)) return false;
    return true;
  });

  const canJump = useSelector((state) => {
    return state.runState.data.navigationData.allowJump;
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
    canJump && !isCurrentGroup(groupCode);

  const isQuestionClickable = (questionCode) =>
    canJump && !isCurrentQuestion(questionCode);

  const closeDrawer = () => {
    if (props.onCloseDrawer) props.onCloseDrawer();
  };

  const scrollToElement = (el) => {
    const container = getClosestScrollableParent(el);
    container.scrollTo({
      top: el.offsetTop - container.offsetTop,
      behavior: "smooth",
    });
  };

  const onGroupClicked = (groupCode) => {
    if (!isGroupClickable(groupCode)) return;
    closeDrawer();
    dispatch(jump({ ...props.navigationIndex, groupId: groupCode }));
  };

  const onQuestionClicked = (questionCode, groupCode) => {
    if (!isQuestionClickable(questionCode)) {
      closeDrawer();
      return;
    }
    closeDrawer();
    const el = document.querySelector(`[data-code="${questionCode}"]`);
    if (el) {
      scrollToElement(el);
      return;
    }
    if (props.onPendingScrollTarget) {
      props.onPendingScrollTarget(questionCode);
    }
    if (props.navigationIndex.name === "group") {
      dispatch(jump({ ...props.navigationIndex, groupId: groupCode }));
    } else {
      dispatch(jump({ ...props.navigationIndex, questionId: questionCode }));
    }
  };

  const questionState = (questionCode) => {
    if (isCurrentQuestion(questionCode)) return "current";
    if (validity_map[questionCode] === false) return "invalid";
    if (answeredSet.has(questionCode)) return "answered";
    return "pending";
  };

  const renderStatusIcon = (state) => {
    if (state === "invalid") {
      return (
        <ErrorOutlineOutlined
          className={styles.statusIcon}
          fontSize="inherit"
          data-status="invalid"
        />
      );
    }
    if (state === "answered") {
      return (
        <CheckCircleOutlineOutlined
          className={styles.statusIcon}
          fontSize="inherit"
          data-status="answered"
        />
      );
    }
    return null;
  };

  if (!props.survey?.groups) return null;

  const groups = props.survey.groups.filter(
    (group) => relevance_map[group.code] && group.groupType != "END",
  );

  return (
    <div className={styles.list}>
      {groups.map((group) => {
        const groupClickable = isGroupClickable(group.code);
        const groupCurrent = isCurrentGroup(group.code);
        const groupLabel = stripTags(group.content?.label) || "";
        return (
          <section key={group.code} className={styles.groupSection}>
            {groupLabel && (
              <div
                className={styles.groupHeader}
                data-clickable={groupClickable ? "true" : "false"}
                data-current={groupCurrent ? "true" : "false"}
                onClick={() => onGroupClicked(group.code)}
              >
                {groupLabel}
              </div>
            )}
            <ul className={styles.questionList}>
              {group.questions
                .filter((question) => relevance_map[question.code])
                .map((question) => {
                  const state = questionState(question.code);
                  const clickable = isQuestionClickable(question.code);
                  const rawLabel = stripTags(question.content?.label) || "";
                  const labelText = rawLabel.trim();
                  return (
                    <li
                      key={question.code}
                      className={styles.questionRow}
                      data-state={state}
                      data-clickable={clickable ? "true" : "false"}
                      onClick={() => onQuestionClicked(question.code, group.code)}
                    >
                      <span className={styles.iconTile}>
                        {questionIconByType(question.type, "1em", iconColor)}
                      </span>
                      <span
                        className={styles.questionLabel}
                        data-empty={labelText ? "false" : "true"}
                      >
                        {labelText}
                      </span>
                      <span className={styles.statusSlot}>
                        {renderStatusIcon(state)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default SurveyIndex;
