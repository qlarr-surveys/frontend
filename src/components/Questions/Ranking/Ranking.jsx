import { Box } from "@mui/system";
import React, { Fragment, useRef } from "react";
import { useDispatch } from "react-redux";
import { shallowEqual, useSelector } from "react-redux";
import styles from "./Ranking.module.css";
import { useDrag, useDrop } from "react-dnd";
import { orderChange, valueChange } from "~/state/runState";
import Content from "~/components/run/Content";
import { useTheme } from "@emotion/react";

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
      }}
    >
      <RankingContainer
        styles={styles}
        theme={theme}
        ordererLength={withOrder.length}
        unordererLength={withoutOrder.length}
        onHover={onHover}
        order={order}
        onItemTransfer={onItemTransfer}
        onDoubleClick={onDoubleClick}
        itemType="unsorted"
        options={withoutOrder}
      />
      <RankingContainer
        styles={styles}
        theme={theme}
        onHover={onHover}
        onItemTransfer={onItemTransfer}
        onDoubleClick={onDoubleClick}
        ordererLength={withOrder.length}
        unordererLength={withoutOrder.length}
        order={order}
        itemType="sorted"
        options={withOrder}
      />
    </div>
  );
}

function RankingContainer({
  styles,
  itemType,
  theme,
  options,
  onItemTransfer,
  onDoubleClick,
  onHover,
}) {
  const refDrop = useRef(null);
  return (
    <Box
      ref={refDrop}
      className={styles.dragContainer}
      sx={{ backgroundColor: "background.default" }}
    >
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
              rankingItemStyle={styles.rankingItem}
              onDoubleClick={onDoubleClick}
            />
          </Fragment>
        );
      })}
      <DropArea
        itemType={itemType}
        index={options.length}
        key="last"
        fillParent={true}
        onItemTransfer={onItemTransfer}
      />
    </Box>
  );
}

function RankingOption({
  theme,
  option,
  onDoubleClick,
  rankingItemStyle,
  index,
  onHover,
  itemType,
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
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onHover(item, option, itemType, index);
    },
  });
  drop(preview(containerRef));
  return (
    <div ref={drag}>
      <Box
        data-code={option.code}
        ref={containerRef}
        data-handler-id={handlerId}
        style={{
          opacity: isDragging ? "0.2" : "1",
        }}
        onDoubleClick={() => onDoubleClick(item)}
        className={rankingItemStyle}
        sx={{ backgroundColor: "background.paper" }}
      >
        <Content
          elementCode={option.code}
          customStyle={`
        font-size: ${theme.textStyles.text.size}px;
        `}
          name="label"
          content={option.content?.label}
        />
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
      style={{ flex: fillParent ? 1 : "inherit", minHeight: "12px" }}
      ref={containerRef}
      data-handler-id={handlerId}
    />
  );
}

export default Ranking;
