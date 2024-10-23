import React from "react";
import styles from "./NewComponentsPanel.module.css";
import NewComponentsItem from "~/components/design/NewComponentsItem";
import { QUESTION_TYPES } from "~/components/Questions/utils";
import { FormatListBulleted, StopCircle } from "@mui/icons-material";

const groups = [
  {
    name: "section_sections",
    type: "sections",
    items: [
      {
        idType: 2,
        type: "group",
        icon: <FormatListBulleted style={{ color: "#16205b" }} />,
      },
    ],
  },
];

function NewComponentsPanel({ t }) {
  return (
    <div className={styles.leftContent}>
      {groups.map((item, index) => (
        <div className={styles.leftPanelGroupItem} key={index}>
          <div className={styles.groupTitle}>{t(item.name)}</div>
          <div className={styles.leftItems}>
            {item.items.map((question, index) => {
              const dragItem = {
                type: "groups",
                itemType: question.type,
                droppableId: "new-groups",
                draggableId: question.type,
                icon: question.icon,
              };

              return (
                <div className={"Draggable"} key={question.type}>
                  <NewComponentsItem t={t} item={dragItem} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {QUESTION_TYPES.map((item, index) => (
        <div className={styles.leftPanelGroupItem} key={index}>
          <div className={styles.groupTitle}>{t(item.name)}</div>
          {item.items.map((question, index) => {
            const dragItem = {
              type: "new-questions",
              itemType: question.type,
              offlineOnly: question.offlineOnly || false,
              droppableId: "new-questions",
              draggableId: question.type,
              icon: question.icon,
            };

            return (
              <div key={`draggable-${index}`}>
                <div className={"Draggable"}>
                  <NewComponentsItem t={t} item={dragItem} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default React.memo(NewComponentsPanel);

export const createGroup = (groupType, gId) => {
  let code = `G${gId}`;
  let state = { groupType, content: { label: {}, description: {} } };
  let newGroup = {
    code,
    qualifiedCode: code,
    type: groupType.toLowerCase(),
    groupType,
  };
  return { newGroup, state };
};
