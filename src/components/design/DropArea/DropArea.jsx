import styles from "./DropArea.module.css";
import { useDrop } from "react-dnd";
import { onDrag } from "~/state/design/designState";
import { useDispatch } from "react-redux";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { getContrastColor, isDisplay } from "~/components/Questions/utils";
import { useInView } from "react-intersection-observer";
import { Box } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";

export function GroupDropArea({ index, groupsCount, t, emptySurvey }) {
  const dispatch = useDispatch();

  const [{ isOver, item }, drop] = useDrop(
    () => ({
      accept: "groups",
      drop: (item) => {
        dispatch(
          onDrag({
            type: "new_group",
            groupType: item.draggableId,
            toIndex: index,
          })
        );
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        item: monitor.getItem(),
      }),
    }),
    [index]
  );
  const isDraggingGroup = item != null && item.draggableId == "group";

  const canDrop =
    item &&
    item.droppableId == "new-groups" &&
    canDropWelcomeGroup(item, index) &&
    canDropEndGroup(item, index, groupsCount) &&
    canSortGroup(item, index);
  const theme = useTheme();

  const contrastColor = getContrastColor(theme.palette.background.paper);

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isDraggingGroup && contrastColor,
        color : theme.palette.text.primary
      }}
      className={
        "" +
        (emptySurvey
          ? styles.groupEmptyHint +
            (isOver ? " " + styles.groupEmptyHintHover : "")
          : isOver && canDrop
          ? styles.groupDropArea
          : isDraggingGroup
          ? styles.groupDragging
          : styles.groupHidden)
      }
    >
      {isDraggingGroup && !emptySurvey && (
        <>
          <span className={styles.dropText}>{t("empty_survey_hint")}</span>
        </>
      )}
      {emptySurvey && <span>{t("empty_survey_hint")}</span>}
    </div>
  );
}

export function QuestionDropArea({
  index,
  isLast = false,
  parentCode,
  parentType,
  parentIndex,
  emptyGroup = false,
  t,
}) {
  const theme = useTheme();
  const dispatch = useDispatch();


  // This is a "hack" to make these components refresh when questions are being reordered.
  // So the first and the last Drag elements can refresh and resize accordingly
  // otherwise, they don't refresh on hover
  const reorderRefreshCode = useSelector((state) => {
    return state.designState["reorder_refresh_code"];
  });

  const [{ isOver, isDragging }, drop] = useDrop(
    () => ({
      accept: ["new-questions", "questions"],
      hover(item) {
        if (item.type !== "questions" || item.droppableId === parentCode) {
          return;
        }
        if (parentType === "end" && !isDisplay(item.itemType)) {
          return;
        }
        dispatch(
          onDrag({
            type: "reparent_question",
            source: item.droppableId,
            destination: parentCode,
            id: item.draggableId,
          })
        );
        item.index = index;
        item.parentIndex = parentIndex;
        item.isLast = isLast;
        item.droppableId = parentCode;
      },
      drop: (item) => {
        if (item.type !== "new-questions") {
          return;
        }
        dispatch(
          onDrag({
            type: "new_question",
            questionType: item.draggableId,
            destination: parentCode,
            toIndex: index,
          })
        );
      },
      collect: (monitor) => {
        return {
          isOver:
            monitor.getItem()?.type == "new-questions" &&
            monitor.isOver() &&
            (parentType !== "end" || isDisplay(monitor.getItem()?.itemType)),
          isDragging:
            parentType === "end" && !isDisplay(monitor.getItem()?.itemType)
              ? false
              : monitor.getItem()?.droppableId === "new-questions" ||
                (monitor.getItem()?.type === "questions" &&
                  monitor.getItem().droppableId !== parentCode &&
                  ((index == 0 &&
                    monitor.getItem().isLast &&
                    monitor.getItem().parentIndex + 1 === parentIndex) ||
                    (isLast &&
                      monitor.getItem().index == 0 &&
                      monitor.getItem().parentIndex - 1 === parentIndex))),
        };
      },
    }),
    [reorderRefreshCode, index]
  );

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
    trackVisibility: isDragging,
    delay: isDragging ? 100 : 0,
  });

  const textContrast = theme.palette.text.primary

  return (
    <div ref={ref}>
      {" "}
      <div
        ref={drop}
        style={{
          marginTop: !isDragging && !isOver ? "-0.5rem" : "inherit",
          marginBottom: !isDragging && !isOver ? "-0.5rem" : "inherit",
        }}
        className={
          "question-drop-area" +
          " " +
          (emptyGroup
            ? isOver
              ? styles.questionDropArea
              : isDragging && inView
              ? styles.isDragging
              : styles.groupEmptyHint
            : isOver
            ? styles.questionDropArea
            : isDragging && inView
            ? styles.isDragging
            : styles.hidden) +
          " "
        }
      >
        {isDragging && !emptyGroup && (
          <Box display="flex" justifyContent="center" alignItems="center">
            <HelpOutline sx={{ marginRight: "8px", color: textContrast }} />
            <span
              className={styles.dropText}
              style={{
                color: textContrast,
              }}
            >
              {t("empty_group_hint")}
            </span>
          </Box>
        )}
        {emptyGroup && (
          <Box display="flex" justifyContent="center" alignItems="center">
            <HelpOutline sx={{ marginRight: "8px", color: textContrast }} />
            <span
              className={styles.dropText}
              style={{
                color: textContrast,
              }}
            >
              {t("empty_group_hint")}
            </span>
          </Box>
        )}
      </div>
    </div>
  );
}

const canSortGroup = (item, index) => {
  if (item?.index === index || index - 1 === item?.index) {
    if (item?.droppableId !== "new-groups") {
      return false;
    }
  }
  return true;
};

const canDropWelcomeGroup = (item, index) => {
  if (item?.draggableId !== "welcome") {
    return true;
  }
  return index === 0;
};

const canDropEndGroup = (item, index, groupsCount) => {
  if (item?.draggableId !== "end") {
    return true;
  }
  return index === groupsCount;
};
