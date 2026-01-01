import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from "react";
import "./MentionList.css";

const MentionList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = useCallback(
    (index) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [items, command]
  );

  // REMOVED the useEffect with document.addEventListener - this was the duplicate!

  useImperativeHandle(
    ref,
    () => ({
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
    }),
    [selectedIndex, items, selectItem]
  );


  return (
    <div className="mention-list">
      {items.length ? (
        items.map((item, index) => (
          <div
            className={`mention-item ${
              index === selectedIndex ? "is-selected" : ""
            }`}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent blur events
              selectItem(index);
            }}
            key={index}
          >
            <span className="mention-label">{item.value || item.label}</span>
            <span className="mention-type">{item.type}</span>
          </div>
        ))
      ) : (
        <div className="mention-item">No result</div>
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
