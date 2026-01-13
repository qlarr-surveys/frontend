import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import "./MentionList.css";

const MentionList = forwardRef(({ items, command }, ref) => {
  const { t } = useTranslation("design");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }
        if (e.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }
        if (e.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, items]);

  const selectItem = (index) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="mention-list">
      {items.length ? (
        items.map((item, index) => (
          <button
            className={`mention-item ${
              index === selectedIndex ? "is-selected" : ""
            }`}
            onClick={() => selectItem(index)}
            key={index}
          >
            <span className="mention-label">{item.value || item.label}</span>
            <span className="mention-type">{item.type}</span>
          </button>
        ))
      ) : (
        <div className="mention-item">{t("mention_no_result")}</div>
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
