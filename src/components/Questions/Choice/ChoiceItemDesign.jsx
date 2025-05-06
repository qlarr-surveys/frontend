import styles from "./ChoiceItemDesign.module.css";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import BuildIcon from "@mui/icons-material/Build";
import { Box, Checkbox, Radio, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  changeContent,
  onDrag,
  removeAnswer,
  setup,
} from "~/state/design/designState";
import { setupOptions } from "~/constants/design";
import { rtlLanguage } from "~/utils/common";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";
import { contentEditable, inDesign } from "~/routes";

function ChoiceItemDesign(props) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef(null);

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const answer = useSelector((state) => {
    return state.designState[props.qualifiedCode];
  });
  const onMainLang = langInfo.lang === langInfo.mainLang;
  const lang = langInfo.lang;

  const isRtl = rtlLanguage.includes(lang);

  const isInSetup = useSelector((state) => {
    return (
      answer.type === "other" &&
      state.designState.setup?.code == props.qualifiedCode + "Atext"
    );
  });

  const content = useSelector((state) => {
    return state.designState[props.qualifiedCode].content?.[lang]?.["label"];
  });

  const mainContent = useSelector((state) => {
    return state.designState[props.qualifiedCode].content?.[
      langInfo.mainLang
    ]?.["label"];
  });

  const getStyles = (isDragging) => {
    const styles = {
      transition: "all 500ms",
    };

    if (isDragging) {
      styles.opacity = 0.5;
    }

    return styles;
  };

  const [isDragging, drag, preview] = useDrag(
    {
      type: props.droppableId,
      item: {
        index: props.index,
        draggableId: props.qualifiedCode,
        type: props.droppableId,
        code: props.code,
        itemType: props.type,
        droppableId: props.droppableId,
      },
      collect: (monitor) => monitor.isDragging(),
    },
    [props]
  );

  const [{ handlerId }, drop] = useDrop({
    accept: props.droppableId,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current || !monitor.isOver({ shallow: true }) || !item) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = props.index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      dispatch(
        onDrag({
          type: "reorder_answers",
          id: item.draggableId,
          fromIndex: item.index,
          toIndex: props.index,
        })
      );

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drop(preview(ref));
  return (
    <div ref={ref} style={getStyles(isDragging)} data-handler-id={handlerId}>
      <Box
        sx={{ backgroundColor: isInSetup ? "beige" : "inherit" }}
        className={styles.answerItem}
      >
        {inDesign(props.designMode) && (
          <div ref={drag} className={styles.answerIcon}>
            <DragIndicatorIcon
              ref={drag}
              sx={{
                fontSize: 18,
              }}
            />
          </div>
        )}
        {props.type === "checkbox" ? (
          <Checkbox sx={{ p: 0 }} disabled />
        ) : props.type === "radio" ? (
          <Radio sx={{ p: 0 }} disabled />
        ) : null}{" "}
        {props.label === "Aother" ? <b>Other</b> : ""}
        <TextField
          variant="standard"
          disabled={!contentEditable(props.designMode)}
          className={
            answer.type === "other" && isRtl
              ? styles.answerControlOtherRtl
              : answer.type === "other"
              ? styles.answerControlOther
              : isRtl
              ? styles.answerControlRtl
              : styles.answerControl
          }
          value={content || ""}
          onChange={(e) =>
            dispatch(
              changeContent({
                code: props.qualifiedCode,
                key: "label",
                lang: lang,
                value: e.target.value,
              })
            )
          }
          placeholder={
            onMainLang
              ? props.t("content_editor_placeholder_option")
              : mainContent || props.t("content_editor_placeholder_option")
          }
          InputProps={{
            sx: {
              "&:before": {
                borderBottom: "0px",
              },
              fontFamily: theme.textStyles.text.font,
              color: theme.textStyles.text.color,
              fontSize: theme.textStyles.text.size,
            },
          }}
        />
        {answer.type === "other" && (
          <BuildIcon
            key="setup"
            sx={{ fontSize: 18 }}
            className={styles.answerIconOther}
            onClick={() => {
              dispatch(
                setup({
                  code: props.qualifiedCode + "Atext",
                  rules: setupOptions("other_text"),
                })
              );
            }}
          />
        )}
        {inDesign(props.designMode) && (
          <CloseIcon
            key="close"
            sx={{ fontSize: 18 }}
            className={styles.answerIcon}
            onClick={(e) => dispatch(removeAnswer(props.qualifiedCode))}
          />
        )}
      </Box>
    </div>
  );
}

export default ChoiceItemDesign;
