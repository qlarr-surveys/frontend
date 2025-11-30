import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ColorPicker from "./ColorPicker";

const CollapsibleInput = ({
  show,
  collapsibleTitle,
  collapsibleBgColor,
  collapsibleTextColor,
  showCollapsibleColorPicker,
  showCollapsibleTextColorPicker,
  setCollapsibleTitle,
  setCollapsibleBgColor,
  setCollapsibleTextColor,
  setShowCollapsibleColorPicker,
  setShowCollapsibleTextColorPicker,
  onUpdate,
  onClose,
  editor,
  colors,
}) => {
  const { t } = useTranslation("design");
  const collapsibleInputRef = useRef(null);
  const collapsibleColorPickerRef = useRef(null);
  const collapsibleTextColorPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        collapsibleInputRef.current &&
        !collapsibleInputRef.current.contains(event.target) &&
        !event.target.closest('button[title="Collapsible Settings"]')
      ) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div className="tiptap-collapsible-input" ref={collapsibleInputRef}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <label style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            {t("tiptap_title")}:
          </label>
          <input
            type="text"
            placeholder={t("tiptap_collapsible_title_placeholder")}
            value={collapsibleTitle}
            onChange={(e) => setCollapsibleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onUpdate();
                onClose();
              } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
                editor.commands.focus();
              }
            }}
          />
        </div>

        <div className="tiptap-collapsible-color-picker-wrapper">
          <label style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            {t("tiptap_background_color")}:
          </label>
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              alignItems: "center",
              position: "relative",
            }}
          >
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowCollapsibleColorPicker(!showCollapsibleColorPicker)}
              className="tiptap-toolbar-button"
              style={{
                backgroundColor: collapsibleBgColor || "#16205b",
                color: "white",
                minWidth: "80px",
              }}
              title={t("tiptap_background_color")}
            >
              {collapsibleBgColor ? "✓" : t("tiptap_default")}
            </button>
            {showCollapsibleColorPicker && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "0.25rem",
                }}
              >
                <ColorPicker
                  show={showCollapsibleColorPicker}
                  onClose={() => setShowCollapsibleColorPicker(false)}
                  onColorSelect={(color) => setCollapsibleBgColor(color)}
                  onRemove={() => setCollapsibleBgColor("")}
                  removeLabel={t("tiptap_remove_color")}
                  pickerRef={collapsibleColorPickerRef}
                  colors={colors}
                />
              </div>
            )}
          </div>
        </div>

        <div className="tiptap-collapsible-text-color-picker-wrapper">
          <label style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
            {t("tiptap_title_color")}:
          </label>
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              alignItems: "center",
              position: "relative",
            }}
          >
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowCollapsibleTextColorPicker(!showCollapsibleTextColorPicker)}
              className="tiptap-toolbar-button"
              style={{
                backgroundColor: collapsibleTextColor || "white",
                color: collapsibleTextColor || "#000",
                border: `2px solid ${collapsibleTextColor || "#ddd"}`,
                minWidth: "80px",
              }}
              title={t("tiptap_title_color")}
            >
              {collapsibleTextColor ? "✓" : t("tiptap_default")}
            </button>
            {showCollapsibleTextColorPicker && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "0.25rem",
                }}
              >
                <ColorPicker
                  show={showCollapsibleTextColorPicker}
                  onClose={() => setShowCollapsibleTextColorPicker(false)}
                  onColorSelect={(color) => setCollapsibleTextColor(color)}
                  onRemove={() => setCollapsibleTextColor("")}
                  removeLabel={t("tiptap_remove_color")}
                  pickerRef={collapsibleTextColorPickerRef}
                  colors={colors}
                />
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onUpdate();
              onClose();
            }}
          >
            {t("ok")}
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onClose();
              editor.commands.focus();
            }}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CollapsibleInput);

