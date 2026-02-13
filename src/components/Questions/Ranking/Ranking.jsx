import { Box } from "@mui/system";
import React, { Fragment, useRef } from "react";
import { useDispatch } from "react-redux";
import { shallowEqual, useSelector } from "react-redux";
import styles from "./Ranking.module.css";
import { useDrag, useDrop } from "react-dnd";
import { orderChange, valueChange } from "~/state/runState";
import Content from "~/components/run/Content";
import { useTheme } from "@emotion/react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { Typography, IconButton } from "@mui/material";

function Ranking(props) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const visibleAnswers = useSelector(
    (state) =>
      props.component.answers.filter((ans) => {
        return state.runState.values[ans.qualifiedCode]?.relevance ?? true;
      }),
    shallowEqual
  );

  const state = useSelector((state) => {
    let valuesMap = {};
    visibleAnswers.forEach((element) => {
      valuesMap[element.qualifiedCode] =
        state.runState.values[element.qualifiedCode].value;
    });
    return valuesMap;
  }, shallowEqual);

  const itemTypeByCode = (code) => {
    return isNaN(state[code]) ? "unsorted" : "sorted";
  };

  const order = useSelector((state) => {
    let valuesMap = {};
    visibleAnswers.forEach((element) => {
      if (state.runState.order) {
        valuesMap[element.qualifiedCode] =
          state.runState.order[element.qualifiedCode];
      } else {
        valuesMap[element.qualifiedCode] =
          state.runState.values[element.qualifiedCode].order + 1;
      }
    });
    return valuesMap;
  }, shallowEqual);

  const withoutOrder = visibleAnswers
    .filter((option) => !state[option.qualifiedCode])
    .sort(function (a, b) {
      return order[a.qualifiedCode] - order[b.qualifiedCode];
    });

  const withOrder = visibleAnswers
    .filter((option) => +state[option.qualifiedCode] > 0)
    .sort(function (a, b) {
      return state[a.qualifiedCode] - state[b.qualifiedCode];
    });

  const onItemTransfer = (item, index, itemType) => {
    const unOrdered = { ...order };
    if (
      itemType == "sorted" &&
      itemTypeByCode(item.qualifiedCode) == "unsorted"
    ) {
      const currentOrder = index + 1;
      for (let key in state) {
        if (state.hasOwnProperty(key)) {
          if (state[key] >= currentOrder) {
            dispatch(
              valueChange({
                componentCode: key,
                value: state[key] + 1,
              })
            );
          }
        }
      }
      dispatch(
        valueChange({
          componentCode: item.qualifiedCode,
          value: currentOrder,
        })
      );
      item.index = index;

      const oldOrder = unOrdered[item.qualifiedCode];
      withoutOrder.forEach((item) => {
        if (unOrdered[item.qualifiedCode] >= oldOrder) {
          unOrdered[item.qualifiedCode] = unOrdered[item.qualifiedCode] - 1;
        }
      });

      dispatch(orderChange(unOrdered));
    } else if (
      itemType == "unsorted" &&
      itemTypeByCode(item.qualifiedCode) == "sorted"
    ) {
      const currentOrder = state[item.qualifiedCode];
      for (let key in state) {
        if (state.hasOwnProperty(key)) {
          if (state[key] >= currentOrder) {
            dispatch(
              valueChange({
                componentCode: key,
                value: state[key] - 1,
              })
            );
          }
        }
      }
      dispatch(
        valueChange({
          componentCode: item.qualifiedCode,
          value: undefined,
        })
      );
      item.index = index;

      const oldOrder = index + 1;

      withoutOrder.forEach((item) => {
        if (unOrdered[item.qualifiedCode] >= oldOrder) {
          unOrdered[item.qualifiedCode] = unOrdered[item.qualifiedCode] + 1;
        }
      });
      unOrdered[item.qualifiedCode] = oldOrder;
      dispatch(orderChange(unOrdered));
    }
  };

  const onClickMove = (option) => {
    const item = { qualifiedCode: option.qualifiedCode };
    if (itemTypeByCode(option.qualifiedCode) == "unsorted") {
      onItemTransfer(item, withOrder.length, "sorted");
    } else {
      onItemTransfer(item, withoutOrder.length, "unsorted");
    }
  };

  const onDoubleClick = (item) => {
    if (itemTypeByCode(item.qualifiedCode) == "unsorted") {
      onItemTransfer(item, withOrder.length, "sorted");
    } else {
      onItemTransfer(item, withoutOrder.length, "unsorted");
    }
  };

  const onHover = (
    hoveringItem,
    currentItem,
    currentItemType,
    currentItemIndex
  ) => {
    const unOrdered = { ...order };
    if (
      currentItemType == "unsorted" &&
      itemTypeByCode(hoveringItem.qualifiedCode) == "unsorted"
    ) {
      const hoveringOrder = unOrdered[hoveringItem.qualifiedCode];
      unOrdered[hoveringItem.qualifiedCode] =
        unOrdered[currentItem.qualifiedCode];
      unOrdered[currentItem.qualifiedCode] = hoveringOrder;
      dispatch(orderChange(unOrdered));
      hoveringItem.index = currentItemIndex;
    } else if (
      currentItemType == "sorted" &&
      itemTypeByCode(hoveringItem.qualifiedCode) == "sorted"
    ) {
      dispatch(
        valueChange({
          componentCode: hoveringItem.qualifiedCode,
          value: state[currentItem.qualifiedCode],
        })
      );
      dispatch(
        valueChange({
          componentCode: currentItem.qualifiedCode,
          value: state[hoveringItem.qualifiedCode],
        })
      );
      hoveringItem.index = currentItemIndex;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
      }}
    >
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            Options
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {withoutOrder.length} remaining
          </Typography>
        </div>
        <RankingContainer
          theme={theme}
          ordererLength={withOrder.length}
          unordererLength={withoutOrder.length}
          onHover={onHover}
          order={order}
          onItemTransfer={onItemTransfer}
          onDoubleClick={onDoubleClick}
          onClickMove={onClickMove}
          itemType="unsorted"
          options={withoutOrder}
          state={state}
        />
      </div>
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            Your Ranking
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {withOrder.length} ranked
          </Typography>
        </div>
        <RankingContainer
          theme={theme}
          onHover={onHover}
          onItemTransfer={onItemTransfer}
          onDoubleClick={onDoubleClick}
          onClickMove={onClickMove}
          ordererLength={withOrder.length}
          unordererLength={withoutOrder.length}
          order={order}
          itemType="sorted"
          options={withOrder}
          state={state}
        />
      </div>
    </div>
  );
}

function RankingContainer({
  itemType,
  theme,
  options,
  onItemTransfer,
  onDoubleClick,
  onClickMove,
  onHover,
  state,
}) {
  const containerRef = useRef(null);
  const [{ isOver }, containerDrop] = useDrop({
    accept: "rankingOption",
    collect(monitor) {
      return { isOver: monitor.isOver({ shallow: false }) };
    },
  });
  containerDrop(containerRef);

  const isSorted = itemType === "sorted";

  return (
    <Box
      ref={containerRef}
      className={styles.dragContainer}
      sx={{
        backgroundColor: isOver
          ? "action.hover"
          : "background.default",
      }}
    >
      {options.length === 0 && (
        <Box
          className={styles.emptyState}
          sx={{ borderColor: "divider" }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {isSorted
              ? "Drag items here to rank them"
              : "All items have been ranked"}
          </Typography>
        </Box>
      )}
      {options.map((option, index) => {
        return (
          <Fragment key={option.code}>
            <DropArea
              itemType={itemType}
              index={index}
              key={"drop" + option.code}
              onItemTransfer={onItemTransfer}
            />
            <RankingOption
              theme={theme}
              index={index}
              key={option.code}
              onHover={onHover}
              itemType={itemType}
              option={option}
              onDoubleClick={onDoubleClick}
              onClickMove={onClickMove}
              rank={isSorted ? state[option.qualifiedCode] : null}
            />
          </Fragment>
        );
      })}
      {options.length > 0 && (
        <DropArea
          itemType={itemType}
          index={options.length}
          key="last"
          fillParent={true}
          onItemTransfer={onItemTransfer}
        />
      )}
    </Box>
  );
}

function RankingOption({
  theme,
  option,
  onDoubleClick,
  onClickMove,
  index,
  onHover,
  itemType,
  rank,
}) {
  const containerRef = useRef();
  const item = {
    index: index,
    qualifiedCode: option.qualifiedCode,
  };
  const [isDragging, drag, preview] = useDrag({
    type: "rankingOption",
    item,
    collect: (monitor) =>
      monitor.getItem()?.qualifiedCode === option.qualifiedCode,
  });

  const [{ handlerId }, drop] = useDrop({
    accept: "rankingOption",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (
        !containerRef.current ||
        !monitor.isOver({ shallow: true }) ||
        !item
      ) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = containerRef.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onHover(item, option, itemType, index);
    },
  });
  drop(preview(containerRef));

  const isSorted = itemType === "sorted";

  return (
    <div ref={drag}>
      <Box
        data-code={option.code}
        ref={containerRef}
        data-handler-id={handlerId}
        className={isDragging ? styles.rankingItemDragging : styles.rankingItem}
        onDoubleClick={() => onDoubleClick(item)}
        sx={{ backgroundColor: "background.paper" }}
      >
        {isSorted && rank != null && (
          <Box className={styles.rankBadge} sx={{ backgroundColor: "primary.main" }}>
            {rank}
          </Box>
        )}
        <DragIndicatorIcon
          className={styles.dragHandle}
          sx={{ color: "text.disabled", fontSize: 20 }}
        />
        <div className={styles.itemContent}>
          <Content
            elementCode={option.code}
            customStyle={`font-size: ${theme.textStyles.text.size}px;`}
            name="label"
            content={option.content?.label}
          />
        </div>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClickMove(option);
          }}
          className={styles.actionButton}
          sx={{ color: "text.secondary" }}
        >
          {isSorted ? <CloseIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      </Box>
    </div>
  );
}

function DropArea({ index, onItemTransfer, itemType, fillParent }) {
  const containerRef = useRef();
  const [{ handlerId }, drop] = useDrop({
    accept: "rankingOption",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (
        !containerRef.current ||
        !monitor.isOver({ shallow: true }) ||
        !item
      ) {
        return;
      }
      onItemTransfer(item, index, itemType);
    },
  });
  drop(containerRef);
  return (
    <div
      style={{ flex: fillParent ? 1 : "inherit", minHeight: "8px" }}
      ref={containerRef}
      data-handler-id={handlerId}
    />
  );
}

export default Ranking;
