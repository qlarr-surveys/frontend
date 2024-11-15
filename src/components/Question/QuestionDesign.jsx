import React, { useCallback, useRef, useState } from "react";
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

function QuestionDesign({
  code,
  type,
  isLast,
  parentCode,
  index,
  t,
  onMainLang,
  parentIndex,
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

      const valueInstruction = {
        code: "value",
        isActive: false,
        returnType: {
          name:
            questionType == "ranking" ||
            questionType == "nps" ||
            questionType == "image_ranking"
              ? "Int"
              : questionType == "scq_array" || questionType == "scq_icon_array"
              ? "String"
              : "Boolean",
        },
        text: "",
      };

      switch (type) {
        case "column":
          nextAnswerIndex = nextId(
            answers.filter((el) => el.type === "column")
          );
          label = "Col" + nextAnswerIndex;
          code = "Ac" + nextAnswerIndex;
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({ label, answer: { code, qualifiedCode, type } })
          );
          break;
        case "row":
          nextAnswerIndex = nextId(answers.filter((el) => el.type === "row"));
          code = "A" + nextAnswerIndex;
          label = "Row" + nextAnswerIndex;
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({
              label,
              instructionList: [valueInstruction],
              answer: { code, qualifiedCode, type },
            })
          );
          break;
        case "other":
          code = "Aother";
          label = "Other";
          qualifiedCode = questionCode + code;
          const instructionListForText = [
            {
              code: "value",
              isActive: false,
              returnType: {
                name: "String",
              },
              text: "",
            },
            {
              code: "conditional_relevance",
              isActive: true,
              returnType: {
                name: "Boolean",
              },
              text:
                questionType === "scq"
                  ? `${questionCode}.value === 'Aother'`
                  : `${questionCode}Aother.value === true`,
            },
          ];
          dispatch(
            addNewAnswer({
              label,
              answer: { code, qualifiedCode, type },
              instructionList: questionType == "mcq" ? [valueInstruction] : [],
            })
          );
          dispatch(
            addNewAnswer({
              instructionList: instructionListForText,
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
          label = "Option" + nextAnswerIndex;
          qualifiedCode = questionCode + code;
          dispatch(
            addNewAnswer({
              label,
              answer: { code, qualifiedCode },
              instructionList:
                questionType == "mcq" ||
                questionType == "image_mcq" ||
                questionType == "icon_mcq" ||
                questionType == "ranking" ||
                questionType == "image_ranking"
                  ? [valueInstruction]
                  : [],
            })
          );
          break;
      }
    },
    [children]
  );

  const contrastColor = getContrastColor(theme.palette.background.paper);
  const textColor = theme.textStyles.question.color;

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
              paddingTop: "2rem",
              paddingBottom: "2rem",
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
        {collapsed && onMainLang && (
          <div className={styles.moveBox} ref={drag}>
            <ViewCompactIcon style={{ color: textColor }} />
          </div>
        )}
        {!collapsed && (isInSetup || hovered) && onMainLang && (
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
            extended={false}
            placeholder={t("content_editor_placeholder_title")}
            contentKey="label"
          />
        </div>
      </Box>

      {question.showDescription && (
        <Box className={styles.textDescriptionContent}>
          <ContentEditor
            code={code}
            extended={true}
            placeholder={t("content_editor_placeholder_description")}
            contentKey="description"
          />
        </Box>
      )}

      <Collapse in={collapsed !== true} timeout="auto" unmountOnExit>
        <QuestionDesignBody
          code={code}
          type={type}
          t={t}
          addAnswer={addAnswer}
          onMainLang={onMainLang}
          addNewAnswer={addAnswer}
        />
      </Collapse>
      <ErrorDisplay code={code} />
    </div>
  );
}

export default React.memo(QuestionDesign);
