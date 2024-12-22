import React, { useRef } from "react";
import QuestionDesign from "~/components/Question/QuestionDesign";
import styles from "./GroupDesign.module.css";
import { useSelector } from "react-redux";
import { QuestionDropArea } from "../design/DropArea/DropArea";
import GroupHeader from "./GroupHeader";
import { Box } from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import { getContrastColor } from "../Questions/utils";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import { onDrag } from "~/state/design/designState";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import { DESIGN_SURVEY_MODE } from '~/routes';
function GroupDesign({ t, code, index, designMode }) {
  const dispatch = useDispatch();
  const group = useSelector((state) => {
    return state.designState[code];
  });

  const inDesign = designMode == DESIGN_SURVEY_MODE.DESIGN

  const collapsed = useSelector((state) => {
    return (
      state.designState["globalSetup"]?.reorder_setup === "collapse_groups"
    );
  });

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const isInSetup = useSelector((state) => {
    return state.designState.setup?.code == code;
  });


  const theme = useTheme();

  const containerRef = useRef();

  const [isDragging, drag, preview] = useDrag({
    type: "groups",
    item: () => {
      return {
        index: index,
        draggableId: code,
        droppableId: "groups",
        type: "groups",
      };
    },
    collect: (monitor) => {
      return monitor.getItem()?.draggableId === code;
    },
  });

  const [collectedProps, drop] = useDrop({
    accept: "groups",
    hover(item, monitor) {
      if (
        !containerRef.current ||
        type == "welcome" ||
        type == "end" ||
        !monitor.isOver({ shallow: true }) ||
        !item ||
        item.droppableId != "groups"
      ) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = containerRef.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (
        dragIndex < hoverIndex &&
        clientOffset.y < hoverBoundingRect.top + 50
      ) {
        return;
      }
      // Dragging upwards
      if (
        dragIndex > hoverIndex &&
        clientOffset.y > hoverBoundingRect.bottom - 50
      ) {
        return;
      }
      dispatch(
        onDrag({
          type: "reorder_groups",
          id: item.draggableId,
          fromIndex: dragIndex,
          toIndex: hoverIndex,
        })
      );

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const onMainLang = langInfo.onMainLang;

  const type = group?.groupType.toLowerCase();

  const children = group?.children;

  const getStyles = (isDragging) => {
    const styles = {
      transition: "all 500ms",
    };

    if (isDragging) {
      styles.opacity = 0.2;
    }

    return styles;
  };

  drop(preview(containerRef));


  const contrastColor = getContrastColor(theme.palette.background.paper);
  const textColor = theme.textStyles.question.color;

  if (!group) {
    return null;
  }

  return (
    <Box
      sx={
        isInSetup
          ? {
            border: `0.5px solid ${textColor}`,
            color: textColor,
            paddingTop: "2rem",
            paddingBottom: "2rem",
            backgroundColor: contrastColor,
          }
          : {
            backgroundColor: "background.paper",
          }
      }
      className={styles.topLevel}
      ref={containerRef}
      style={getStyles(isDragging)}
    >
      {collapsed == true &&
        type !== "welcome" &&
        type !== "end" ? (
        <div className={styles.moveBox} ref={drag}>
          <ViewCompactIcon style={{ color: textColor }} />
        </div>
      ) : (
        <br />
      )}
      <GroupHeader t={t} code={code} index={index} designMode={designMode} children={children} />
      {(collapsed !== true) && (
        <>
          {children && children.length > 0 && (
            <QuestionDropArea
              index={0}
              parentCode={code}
              parentType={type}
              parentIndex={index}
              t={t}
            />
          )}
          {children?.map((quest, childIndex) => {
            return (
              <React.Fragment key={quest.code}>
                <QuestionDesign
                  t={t}
                  key={quest.code}
                  parentCode={code}
                  parentIndex={index}
                  index={childIndex}
                  isLast={children.length == childIndex + 1}
                  type={quest.type}
                  code={quest.code}
                  designMode={designMode}
                  onMainLang={inDesign}
                />
                <QuestionDropArea
                  isLast={children.length == childIndex + 1}
                  index={childIndex + 1}
                  parentIndex={index}
                  parentCode={code}
                  parentType={type}
                  t={t}
                />
              </React.Fragment>
            );
          })}
          {(!children || !children.length) && inDesign && (
            <QuestionDropArea
              t={t}
              index={0}
              parentCode={code}
              parentType={type}
              emptyGroup={true}
            />
          )}
        </>
      )}
    </Box>
  );
}

export default React.memo(GroupDesign);
