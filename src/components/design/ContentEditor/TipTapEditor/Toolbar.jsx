import React from "react";
import "./Toolbar.css";
import { useTranslation } from "react-i18next";
import FontSizeSelector from "./Toolbar/FontSizeSelector";
import LinkInput from "./Toolbar/LinkInput";
import ImageSizeInput from "./Toolbar/ImageSizeInput";
import CollapsibleInput from "./Toolbar/CollapsibleInput";
import FormatButton from "./Toolbar/FormatButton";
import ColorPickerButton from "./Toolbar/ColorPickerButton";
import ImageUploadButton from "./Toolbar/ImageUploadButton";
import ListControls from "./Toolbar/ListControls";
import { useToolbar } from "./Toolbar/useToolbar";

const Toolbar = ({ editor, extended }) => {
  const { t } = useTranslation("design");

  const {
    // State
    showColorPicker,
    setShowColorPicker,
    showBgColorPicker,
    setShowBgColorPicker,
    showLinkInput,
    setShowLinkInput,
    linkUrl,
    setLinkUrl,
    linkText,
    setLinkText,
    isUploadingImage,
    currentFontSize,
    showImageSizeInput,
    setShowImageSizeInput,
    imageWidth,
    imageHeight,
    maintainAspectRatio,
    showCollapsibleInput,
    setShowCollapsibleInput,
    collapsibleTitle,
    setCollapsibleTitle,
    collapsibleBgColor,
    setCollapsibleBgColor,
    collapsibleTextColor,
    setCollapsibleTextColor,
    showCollapsibleColorPicker,
    setShowCollapsibleColorPicker,
    showCollapsibleTextColorPicker,
    setShowCollapsibleTextColorPicker,
    // Refs
    colorPickerRef,
    bgColorPickerRef,
    // Memoized
    colors,
    // Methods
    setFontSize,
    setLink,
    toggleLink,
    handleImageUpload,
    insertCollapsible,
    updateCollapsible,
    toggleCollapsibleInput,
    updateImageSize,
    toggleImageSizeInput,
    handleWidthChange,
    handleHeightChange,
    handleAspectRatioToggle,
  } = useToolbar({ editor });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-toolbar">
      {/* Font Size */}
      <FontSizeSelector
        currentFontSize={currentFontSize}
        setFontSize={setFontSize}
      />

      {/* Bold */}
      <FormatButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title={t("tiptap_bold")}
      >
        <strong>B</strong>
      </FormatButton>

      {/* Italic */}
      <FormatButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title={t("tiptap_italic")}
      >
        <em>I</em>
      </FormatButton>

      {/* Underline */}
      <FormatButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title={t("tiptap_underline")}
      >
        <u>U</u>
      </FormatButton>

      {/* Strike */}
      <FormatButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title={t("tiptap_strikethrough")}
      >
        <s>S</s>
      </FormatButton>

      {/* Link */}
      <FormatButton
        onClick={toggleLink}
        isActive={editor.isActive("link")}
        title={t("tiptap_link")}
      >
        🔗
      </FormatButton>

      <LinkInput
        show={showLinkInput}
        linkUrl={linkUrl}
        linkText={linkText}
        setLinkUrl={setLinkUrl}
        setLinkText={setLinkText}
        onSetLink={setLink}
        onClose={() => {
          setShowLinkInput(false);
          setLinkUrl("");
          setLinkText("");
        }}
        editor={editor}
      />

      {extended && <ListControls editor={editor} />}

      {/* Text Color */}
      <ColorPickerButton
        show={showColorPicker}
        onToggle={setShowColorPicker}
        onColorSelect={(color) => {
          editor.chain().focus().setColor(color).run();
        }}
        onRemove={() => {
          editor.chain().focus().unsetColor().run();
        }}
        removeLabel={t("tiptap_remove_color")}
        pickerRef={colorPickerRef}
        colors={colors}
        title={t("tiptap_text_color")}
        indicatorStyle={{
          borderBottom: `3px solid ${
            editor.getAttributes("textStyle").color || "#000000"
          }`,
          display: "inline-block",
          width: "16px",
          height: "16px",
        }}
        indicatorContent="A"
      />

      {/* Background Color */}
      <ColorPickerButton
        show={showBgColorPicker}
        onToggle={setShowBgColorPicker}
        onColorSelect={(color) => {
          editor.chain().focus().toggleHighlight({ color }).run();
        }}
        onRemove={() => {
          editor.chain().focus().unsetHighlight().run();
        }}
        removeLabel={t("tiptap_remove_background")}
        pickerRef={bgColorPickerRef}
        colors={colors}
        title={t("tiptap_background_color")}
        indicatorStyle={{
          backgroundColor:
            editor.getAttributes("highlight").color || "transparent",
          display: "inline-block",
          width: "16px",
          height: "16px",
          border: "1px solid #ccc",
        }}
        indicatorContent="&nbsp;"
      />

      {/* Image Upload */}
      <ImageUploadButton
        onImageUpload={handleImageUpload}
        isUploading={isUploadingImage}
      />

      {/* Image Size - Only show when image is selected */}
      {editor.isActive("image") && (
        <div className="tiptap-color-picker-wrapper">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleImageSizeInput}
            className={`tiptap-toolbar-button ${
              showImageSizeInput ? "is-active" : ""
            }`}
            title={t("tiptap_image_size")}
          >
            📐
          </button>
          <ImageSizeInput
            show={showImageSizeInput}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            maintainAspectRatio={maintainAspectRatio}
            onWidthChange={handleWidthChange}
            onHeightChange={handleHeightChange}
            onAspectRatioToggle={handleAspectRatioToggle}
            onUpdate={updateImageSize}
            onClose={() => setShowImageSizeInput(false)}
            editor={editor}
          />
        </div>
      )}

      {/* Collapsible/Details */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertCollapsible}
        className="tiptap-toolbar-button"
        title={t("tiptap_insert_collapsible")}
        disabled={editor.isActive("collapsible")}
      >
        <span style={{ fontSize: "12px" }}>▼</span>
      </button>

      {/* Collapsible Settings - Only show when collapsible is selected */}
      {editor.isActive("collapsible") && (
        <div className="tiptap-color-picker-wrapper">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleCollapsibleInput}
            className={`tiptap-toolbar-button ${
              showCollapsibleInput ? "is-active" : ""
            }`}
            title={t("tiptap_collapsible_settings")}
          >
            ⚙️
          </button>
          <CollapsibleInput
            show={showCollapsibleInput}
            collapsibleTitle={collapsibleTitle}
            collapsibleBgColor={collapsibleBgColor}
            collapsibleTextColor={collapsibleTextColor}
            showCollapsibleColorPicker={showCollapsibleColorPicker}
            showCollapsibleTextColorPicker={showCollapsibleTextColorPicker}
            setCollapsibleTitle={setCollapsibleTitle}
            setCollapsibleBgColor={setCollapsibleBgColor}
            setCollapsibleTextColor={setCollapsibleTextColor}
            setShowCollapsibleColorPicker={setShowCollapsibleColorPicker}
            setShowCollapsibleTextColorPicker={
              setShowCollapsibleTextColorPicker
            }
            onUpdate={updateCollapsible}
            onClose={() => setShowCollapsibleInput(false)}
            editor={editor}
            colors={colors}
          />
        </div>
      )}

      {/* Clear Formatting */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          editor.chain().focus().clearNodes().unsetAllMarks().unsetLink().run();
          setShowLinkInput(false);
          setLinkUrl("");
        }}
        className="tiptap-toolbar-button"
        title={t("tiptap_clear_formatting")}
      >
        🗑
      </button>
    </div>
  );
};

export default Toolbar;
