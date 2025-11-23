import React, { useCallback, useState, useRef, useEffect } from "react";
import "./Toolbar.css";
import { useService } from "~/hooks/use-service";
import { buildResourceUrl } from "~/networking/common";
import PhotoIcon from "@mui/icons-material/Photo";
import LoadingDots from "~/components/common/LoadingDots";

const Toolbar = ({ editor, extended, code }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("1em");
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const bgColorPickerRef = useRef(null);
  const linkInputRef = useRef(null);
  const designService = useService("design");

  const fontSizes = [
    { label: "Small", value: "0.75em" },
    { label: "Normal", value: "1em" },
    { label: "Large", value: "1.5em" },
    { label: "Huge", value: "2.5em" },
  ];

  const colors = [
    "#000000",
    "#e60000",
    "#ff9900",
    "#ffff00",
    "#008a00",
    "#0066cc",
    "#9933ff",
    "#ffffff",
    "#facccc",
    "#ffebcc",
    "#ffffcc",
    "#cce8cc",
    "#cce0f5",
    "#ebd6ff",
    "#bbbbbb",
    "#f06666",
    "#ffc266",
    "#ffff66",
    "#66b966",
    "#66a3e0",
    "#c285ff",
    "#888888",
    "#a10000",
    "#b26b00",
    "#b2b200",
    "#006100",
    "#0047b2",
    "#6b24b2",
    "#444444",
    "#5c0000",
    "#663d00",
    "#666600",
    "#003700",
    "#002966",
    "#3d1466",
  ];

  const setFontSize = useCallback(
    (size) => {
      editor.chain().focus().setFontSize(size).run();
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    const updateFontSize = () => {
      const attrs = editor.getAttributes("textStyle");
      const fontSize = attrs?.fontSize;
      if (fontSize && fontSizes.some((size) => size.value === fontSize)) {
        setCurrentFontSize(fontSize);
      } else {
        setCurrentFontSize("1em");
      }
    };

    updateFontSize();

    const handleUpdate = () => {
      requestAnimationFrame(updateFontSize);
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);
    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    const trimmedUrl = linkUrl.trim();
    if (trimmedUrl) {
      let finalUrl = trimmedUrl;
      if (!trimmedUrl.match(/^https?:\/\//i)) {
        finalUrl = `http://${trimmedUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const toggleLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    if (previousUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const currentUrl = editor.getAttributes("link").href || "";
      setLinkUrl(currentUrl);
      setShowLinkInput(true);
    }
  }, [editor]);

  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return;
      }

      setIsUploadingImage(true);
      try {
        const response = await designService.uploadResource(file);
        const imageUrl = buildResourceUrl(response.name);

        editor
          .chain()
          .focus()
          .setImage({
            src: imageUrl,
            alt: file.name,
            resourceName: response.name,
          })
          .run();
      } catch (error) {
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, designService]
  );

  const insertCollapsible = useCallback(() => {
    editor
      .chain()
      .focus()
      .setCollapsible({
        open: false,
        buttonText: "Show more details",
      })
      .run();
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        !event.target.closest(".tiptap-color-picker-wrapper")
      ) {
        setShowColorPicker(false);
      }
      if (
        bgColorPickerRef.current &&
        !bgColorPickerRef.current.contains(event.target) &&
        !event.target.closest(".tiptap-color-picker-wrapper")
      ) {
        setShowBgColorPicker(false);
      }
      if (
        linkInputRef.current &&
        !linkInputRef.current.contains(event.target) &&
        !event.target.closest('button[title="Link"]')
      ) {
        setShowLinkInput(false);
      }
    };

    if (showColorPicker || showBgColorPicker || showLinkInput) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showColorPicker, showBgColorPicker, showLinkInput]);

  useEffect(() => {
    if (showLinkInput) {
      const currentUrl = editor.getAttributes("link").href || "";
      if (currentUrl && !linkUrl) {
        setLinkUrl(currentUrl);
      }
    }
  }, [showLinkInput, editor, linkUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-toolbar">
      {/* Font Size */}
      <select
        className="tiptap-toolbar-button"
        onChange={(e) => setFontSize(e.target.value)}
        value={currentFontSize}
      >
        {fontSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

      {/* Bold */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`tiptap-toolbar-button ${
          editor.isActive("bold") ? "is-active" : ""
        }`}
        title="Bold"
      >
        <strong>B</strong>
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`tiptap-toolbar-button ${
          editor.isActive("italic") ? "is-active" : ""
        }`}
        title="Italic"
      >
        <em>I</em>
      </button>

      {/* Underline */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`tiptap-toolbar-button ${
          editor.isActive("underline") ? "is-active" : ""
        }`}
        title="Underline"
      >
        <u>U</u>
      </button>

      {/* Strike */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`tiptap-toolbar-button ${
          editor.isActive("strike") ? "is-active" : ""
        }`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      {/* Link */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleLink}
        className={`tiptap-toolbar-button ${
          editor.isActive("link") ? "is-active" : ""
        }`}
        title="Link"
      >
        🔗
      </button>

      {showLinkInput && (
        <div className="tiptap-link-input" ref={linkInputRef}>
          <input
            type="url"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setShowLinkInput(false);
                setLinkUrl("");
                editor.commands.focus();
              }
            }}
            autoFocus
          />
          <button onMouseDown={(e) => e.preventDefault()} onClick={setLink}>
            OK
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
              editor.commands.focus();
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {extended && (
        <>
          {/* Ordered List */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tiptap-toolbar-button ${
              editor.isActive("orderedList") ? "is-active" : ""
            }`}
            title="Ordered List"
          >
            1.
          </button>

          {/* Bullet List */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tiptap-toolbar-button ${
              editor.isActive("bulletList") ? "is-active" : ""
            }`}
            title="Bullet List"
          >
            •
          </button>

          {/* Decrease Indent */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
            className="tiptap-toolbar-button"
            title="Decrease Indent"
            disabled={!editor.can().liftListItem("listItem")}
          >
            ◂
          </button>

          {/* Increase Indent */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              editor.chain().focus().sinkListItem("listItem").run()
            }
            className="tiptap-toolbar-button"
            title="Increase Indent"
            disabled={!editor.can().sinkListItem("listItem")}
          >
            ▸
          </button>
        </>
      )}

      {/* Text Color */}
      <div className="tiptap-color-picker-wrapper">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="tiptap-toolbar-button"
          title="Text Color"
        >
          <span
            style={{
              borderBottom: `3px solid ${
                editor.getAttributes("textStyle").color || "#000000"
              }`,
              display: "inline-block",
              width: "16px",
              height: "16px",
            }}
          >
            A
          </span>
        </button>
        {showColorPicker && (
          <div className="tiptap-color-palette" ref={colorPickerRef}>
            {colors.map((color) => (
              <button
                key={color}
                className="tiptap-color-option"
                style={{ backgroundColor: color }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  setShowColorPicker(false);
                }}
                title={color}
              />
            ))}
            <button
              className="tiptap-color-option tiptap-color-remove"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColorPicker(false);
              }}
              title="Remove color"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="tiptap-color-picker-wrapper">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
          className="tiptap-toolbar-button"
          title="Background Color"
        >
          <span
            style={{
              backgroundColor:
                editor.getAttributes("highlight").color || "transparent",
              display: "inline-block",
              width: "16px",
              height: "16px",
              border: "1px solid #ccc",
            }}
          >
            &nbsp;
          </span>
        </button>
        {showBgColorPicker && (
          <div className="tiptap-color-palette" ref={bgColorPickerRef}>
            {colors.map((color) => (
              <button
                key={color}
                className="tiptap-color-option"
                style={{ backgroundColor: color }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color }).run();
                  setShowBgColorPicker(false);
                }}
                title={color}
              />
            ))}
            <button
              className="tiptap-color-option tiptap-color-remove"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowBgColorPicker(false);
              }}
              title="Remove background"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div
        style={{ display: "inline-block" }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <label
          style={{
            display: "inline-block",
            cursor: isUploadingImage ? "not-allowed" : "pointer",
            margin: 0,
            padding: 0,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            disabled={isUploadingImage}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
          <span
            className="tiptap-toolbar-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: isUploadingImage ? "none" : "auto",
              opacity: isUploadingImage ? 0.6 : 1,
            }}
            title="Insert Image"
          >
            {isUploadingImage ? (
              <LoadingDots />
            ) : (
              <PhotoIcon style={{ fontSize: "16px" }} />
            )}
          </span>
        </label>
      </div>

      {/* Collapsible/Details */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertCollapsible}
        className="tiptap-toolbar-button"
        title="Insert Collapsible Section"
      >
        <span style={{ fontSize: "12px" }}>▼</span>
      </button>

      {/* Clear Formatting */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        className="tiptap-toolbar-button"
        title="Clear Formatting"
      >
        🗑
      </button>
    </div>
  );
};

export default Toolbar;
