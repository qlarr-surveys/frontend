import React from "react";
import styles from "./NewComponentsItem.module.css";
import { useDrag } from "react-dnd";

function NewComponentsItem({ t, item }) {
  const [isDragging, drag] = useDrag({
    type: item.type,
    item: {
      draggableId: item.draggableId,
      droppableId: item.droppableId,
      itemType: item.itemType,
      type: item.type,
    },
    collect: (monitor) => {
      return monitor.isDragging();
    },
  });

  return (
    <div
      ref={drag}
      className={
        styles.leftPannelItem +
        (item?.dragLayer ? " " + styles.isDrayLayer : "")
      }
    >
      {item.icon}
      {t("component_" + item.itemType + "_title")}
    </div>
  );
}

export default NewComponentsItem;
