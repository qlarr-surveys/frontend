import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import "./MentionList.css";

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command({
        id: item.id,
        label: item.value,
        "data-type": item.type,
        "data-instruction": item.instruction,
      });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="mention-list">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`mention-item ${
              index === selectedIndex ? "is-selected" : ""
            }`}
            key={item.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectItem(index)}
          >
            <div className="mention-item-label">{item.value}</div>
            <div className="mention-item-type">{item.type}</div>
          </button>
        ))
      ) : (
        <div className="mention-item mention-empty">No results</div>
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
