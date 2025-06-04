import React, { useCallback, useEffect, useRef, useState } from "react";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";

import styles from "./QuestionDesign.module.css";
import { nextId } from "~/utils/design/utils";
import ContentEditor from "~/components/design/ContentEditor";
import { Box, Collapse } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ErrorDisplay from "~/components/design/ErrorDisplay";
import { useSelector } from "react-redux";
import {
  addNewAnswer,
  cloneQuestion,
  deleteQuestion,
  onDrag,
} from "~/state/design/designState";
import { useDispatch } from "react-redux";
import { useDrag, useDrop } from "react-dnd";

import ActionToolbar from "~/components/design/ActionToolbar";
import QuestionDesignBody from "./QuestionDesignBody";
import { getContrastColor, questionIconByType } from "../Questions/utils";
import { hasMajorSetup } from "~/constants/design";
import { DESIGN_SURVEY_MODE } from "~/routes";

function QuestionDesign({
  code,
  type,
  isLast,
  parentCode,
  index,
  t,
  designMode,
  onMainLang,
  parentIndex,
  lastAddedComponent,
}) {
  console.debug(code + ": " + index);
  const [hovered, setHovered] = useState(false);

  const containerRef = useRef();
  const dispatch = useDispatch();
  const theme = useTheme();

  const isInSetup = useSelector((state) => {
    return state.designState.setup?.code == code;
  });

  const question = useSelector((state) => {
    return state.designState[code];
  });

  const children = question.children;

  const collapsed = useSelector((state) => {
    return (
      state.designState["globalSetup"]?.reorder_setup === "collapse_questions"
    );
  });

  const noMajorSetup = useSelector(
    (state) => !hasMajorSetup(state.designState.setup)
  );

  const onDelete = useCallback(() => dispatch(deleteQuestion(code)), []);
  const onClone = useCallback(() => dispatch(cloneQuestion(code)), []);

  const [isDragging, drag, preview] = useDrag({
    type: "questions",
    item: {
      index: index,
      draggableId: code,
      droppableId: parentCode,
      parentIndex: parentIndex,
      isLast: isLast,
      type: "questions",
      itemType: type,
    },
    collect: (monitor) => {
      return monitor.getItem()?.draggableId === code;
    },
  });

  const [collectedProps, drop] = useDrop({
    accept: "questions",
    hover(item, monitor) {
      if (
        !containerRef.current ||
        !monitor.isOver({ shallow: true }) ||
        !item ||
        !item.droppableId.startsWith("G")
      ) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex || item?.droppableId !== parentCode) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = containerRef.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (
        dragIndex < hoverIndex &&
        clientOffset.y < hoverBoundingRect.top + 20
      ) {
        return;
      }
      // Dragging upwards
      if (
        dragIndex > hoverIndex &&
        clientOffset.y > hoverBoundingRect.bottom - 20
      ) {
        return;
      }
      dispatch(
        onDrag({
          type: "reorder_questions",
          source: item.droppableId,
          destination: parentCode,
          id: item.draggableId,
          fromIndex: dragIndex,
          toIndex: hoverIndex + 1,
        })
      );

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.isLast = isLast;
    },
  });

  drop(preview(containerRef));

  const addAnswer = React.useCallback(
    (questionCode, questionType, type) => {
      const answers = children || [];
      let nextAnswerIndex = 1;
      let code = "";
      let qualifiedCode = "";
      let label = "";

      switch (type) {
        case "column":
          nextAnswerIndex = nextId(
            answers.filter((el) => el.type === "column")
          );
          label = "Col " + nextAnswerIndex;
          code = "Ac" + nextAnswerIndex;
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({ label, answer: { code, qualifiedCode, type } })
          );
          break;
        case "row":
          nextAnswerIndex = nextId(answers.filter((el) => el.type === "row"));
          code = "A" + nextAnswerIndex;
          label = "Row " + nextAnswerIndex;
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({
              label,
              answer: { code, qualifiedCode, type },
            })
          );
          break;
        case "other":
          code = "Aother";
          label = "Other";
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({
              label,
              answer: { code, qualifiedCode, type },
            })
          );
          dispatch(
            addNewAnswer({
              answer: {
                code: "Atext",
                qualifiedCode: qualifiedCode + "Atext",
                type: "other_text",
              },
            })
          );
          break;
        default:
          nextAnswerIndex = nextId(answers);
          code = "A" + nextAnswerIndex;
          label = "Option " + nextAnswerIndex;
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({
              label,
              answer: { code, qualifiedCode },
            })
          );
          break;
      }
    },
    [children]
  );

  const contrastColor = getContrastColor(theme.palette.background.paper);
  const textColor = theme.textStyles.question.color;

  useEffect(() => {
    const element = containerRef.current;

    if (
      lastAddedComponent?.type === "question" &&
      lastAddedComponent.groupIndex === parentIndex &&
      lastAddedComponent.questionIndex === index &&
      element
    ) {
      // Delay the addition of the highlight class to ensure the DOM is ready
      const timeoutId = setTimeout(() => {
        element.classList.add(styles.highlight);

        const handleAnimationEnd = () => {
          element.classList.remove(styles.highlight);
        };

        element.addEventListener("animationend", handleAnimationEnd);

        return () => {
          element.removeEventListener("animationend", handleAnimationEnd);
        };
      }, 50);
      // Delay of 50ms to allow DOM rendering

      return () => clearTimeout(timeoutId); // Cleanup timeout on unmount or re-render
    }
  }, [lastAddedComponent, parentIndex, index]);

  const isLastAdded =
    lastAddedComponent?.type === "question" &&
    lastAddedComponent.groupIndex === parentIndex &&
    lastAddedComponent.questionIndex === index;
  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={
        isInSetup
          ? {
              border: `0.5px solid ${textColor}`,
              backgroundColor: contrastColor,
              color: textColor,
            }
          : {
              opacity: isDragging ? "0.2" : "1",
              border: isDragging ? "dotted 1px " + contrastColor : "0",
            }
      }
      className={`question ${styles.groupQuestion}`}
      data-code={code}
    >
      <Box className={styles.contentContainer}>
        {collapsed && (
          <div className={styles.moveBox} ref={drag}>
            <ViewCompactIcon style={{ color: textColor }} />
          </div>
        )}
        {designMode == DESIGN_SURVEY_MODE.DESIGN && (isInSetup || hovered) && (
          <div className={styles.actionToolbarVisible}>
            <ActionToolbar
              t={t}
              isGroup={false}
              isInSetup={isInSetup}
              code={code}
              parentCode={parentCode}
              onClone={onClone}
              onDelete={onDelete}
              disableDelete={false}
            />
          </div>
        )}
      </Box>

      <Box className={styles.titleContainer}>
        <Box className={styles.iconBox}>
          {questionIconByType(`${type}`, undefined, textColor)}
        </Box>
        <div
          className={styles.titleQuestion}
          style={{
            fontFamily: theme.textStyles.question.font,
            color: theme.textStyles.question.color,
            fontSize: theme.textStyles.question.size,
          }}
        >
          <ContentEditor
            code={code}
            editable={
              designMode == DESIGN_SURVEY_MODE.DESIGN ||
              designMode == DESIGN_SURVEY_MODE.LANGUAGES
            }
            extended={type=="text_display"}
            placeholder={t("content_editor_placeholder_title")}
            contentKey="label"
            useSampleData={false}
          />
        </div>
      </Box>

      {question.showDescription && (
        <Box className={styles.textDescriptionContent}>
          <ContentEditor
            code={code}
            editable={
              designMode == DESIGN_SURVEY_MODE.DESIGN ||
              designMode == DESIGN_SURVEY_MODE.LANGUAGES
            }
            extended={true}
            placeholder={t("content_editor_placeholder_description")}
            contentKey="description"
            useSampleData={false}
          />
        </Box>
      )}

      <Collapse in={collapsed !== true} timeout="auto" unmountOnExit>
        <QuestionDesignBody
          code={code}
          type={type}
          t={t}
          addAnswer={addAnswer}
          designMode={designMode}
          onMainLang={onMainLang}
          addNewAnswer={addAnswer}
        />
      </Collapse>
      <ErrorDisplay code={code} />
    </div>
  );
}

export default React.memo(QuestionDesign);
