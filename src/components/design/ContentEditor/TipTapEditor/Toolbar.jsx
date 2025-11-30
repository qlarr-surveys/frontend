import React, { useCallback, useState, useRef, useEffect } from "react";
import "./Toolbar.css";
import { useService } from "~/hooks/use-service";
import { buildResourceUrl } from "~/networking/common";
import PhotoIcon from "@mui/icons-material/Photo";
import LoadingDots from "~/components/common/LoadingDots";
import { useTranslation } from "react-i18next";

const Toolbar = ({ editor, extended, code }) => {
  const { t } = useTranslation("design");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("1em");
  const [showImageSizeInput, setShowImageSizeInput] = useState(false);
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [showCollapsibleInput, setShowCollapsibleInput] = useState(false);
  const [collapsibleTitle, setCollapsibleTitle] = useState("");
  const [collapsibleBgColor, setCollapsibleBgColor] = useState("");
  const [collapsibleTextColor, setCollapsibleTextColor] = useState("");
  const aspectRatioRef = useRef(null);
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const bgColorPickerRef = useRef(null);
  const linkInputRef = useRef(null);
  const imageSizeInputRef = useRef(null);
  const collapsibleInputRef = useRef(null);
  const collapsibleColorPickerRef = useRef(null);
  const collapsibleTextColorPickerRef = useRef(null);
  const [showCollapsibleColorPicker, setShowCollapsibleColorPicker] =
    useState(false);
  const [showCollapsibleTextColorPicker, setShowCollapsibleTextColorPicker] =
    useState(false);
  const designService = useService("design");

  const fontSizes = [
    { label: t("tiptap_font_size_small"), value: "0.75em" },
    { label: t("tiptap_font_size_normal"), value: "1em" },
    { label: t("tiptap_font_size_large"), value: "1.5em" },
    { label: t("tiptap_font_size_huge"), value: "2.5em" },
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

    const updateImageSize = () => {
      if (editor.isActive("image")) {
        const attrs = editor.getAttributes("image");
        // Only update the values if the input is not currently shown
        // This prevents overwriting user input while they're typing
        if (!showImageSizeInput) {
          let width = attrs.width || "";
          let height = attrs.height || "";

          // If attributes are not set, get the actual rendered dimensions from the DOM
          if (!width || !height) {
            try {
              const { from } = editor.state.selection;
              const node = editor.state.doc.nodeAt(from);
              if (node && node.type.name === "image") {
                // Get the DOM node for the image - find the position where the node starts
                const domAtPos = editor.view.domAtPos(from);
                let imageElement = null;

                // The domAtPos might give us the image directly or a parent element
                if (domAtPos.node) {
                  // Check if it's an element node (has tagName property)
                  if (domAtPos.node.tagName) {
                    if (domAtPos.node.tagName === "IMG") {
                      imageElement = domAtPos.node;
                    } else {
                      // Look for img tag in the parent or nearby
                      imageElement = domAtPos.node.querySelector?.("img");
                      if (!imageElement && domAtPos.node.parentElement) {
                        imageElement =
                          domAtPos.node.parentElement.querySelector?.("img");
                      }
                    }
                  }
                }

                // Alternative: search in the editor's DOM
                if (!imageElement && editor.view.dom) {
                  const editorDom = editor.view.dom;
                  const images = editorDom.querySelectorAll("img");
                  // Find the image that matches our node's src
                  if (images.length > 0 && attrs.src) {
                    imageElement = Array.from(images).find(
                      (img) =>
                        img.src === attrs.src ||
                        img.getAttribute("src") === attrs.src
                    );
                  }
                  // If no match by src, use the first image (fallback)
                  if (!imageElement && images.length > 0) {
                    imageElement = images[0];
                  }
                }

                if (imageElement) {
                  // Use offsetWidth/offsetHeight for rendered size, fallback to naturalWidth/naturalHeight
                  if (!width) {
                    const renderedWidth =
                      imageElement.offsetWidth ||
                      imageElement.naturalWidth ||
                      0;
                    width = renderedWidth > 0 ? renderedWidth.toString() : "";
                  }
                  if (!height) {
                    const renderedHeight =
                      imageElement.offsetHeight ||
                      imageElement.naturalHeight ||
                      0;
                    height =
                      renderedHeight > 0 ? renderedHeight.toString() : "";
                  }
                }
              }
            } catch (error) {
              // Fallback to attributes if DOM access fails
            }
          }

          setImageWidth(width);
          setImageHeight(height);

          // Calculate and store aspect ratio
          if (width && height) {
            const widthNum = parseFloat(width);
            const heightNum = parseFloat(height);
            if (widthNum > 0 && heightNum > 0) {
              aspectRatioRef.current = widthNum / heightNum;
            }
          }
        }
      } else {
        // Hide input and clear values when image is deselected
        if (showImageSizeInput) {
          setShowImageSizeInput(false);
        }
        setImageWidth("");
        setImageHeight("");
        aspectRatioRef.current = null;
      }
    };

    const updateCollapsibleState = () => {
      if (editor.isActive("collapsible")) {
        const attrs = editor.getAttributes("collapsible");
        if (!showCollapsibleInput) {
          setCollapsibleTitle(
            attrs.buttonText || t("tiptap_collapsible_title_placeholder")
          );
          setCollapsibleBgColor(attrs.backgroundColor || "");
          setCollapsibleTextColor(attrs.textColor || "");
        }
      } else {
        if (showCollapsibleInput) {
          setShowCollapsibleInput(false);
        }
        setCollapsibleTitle("");
        setCollapsibleBgColor("");
        setCollapsibleTextColor("");
      }
    };

    updateFontSize();
    updateImageSize();
    updateCollapsibleState();

    const handleUpdate = () => {
      requestAnimationFrame(() => {
        updateFontSize();
        updateImageSize();
        updateCollapsibleState();
      });
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);
    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
      editor.off("transaction", handleUpdate);
    };
  }, [editor, showImageSizeInput, showCollapsibleInput]);

  const setLink = useCallback(() => {
    const trimmedUrl = linkUrl.trim();
    const trimmedText = linkText.trim();

    if (trimmedUrl) {
      let finalUrl = trimmedUrl;
      if (trimmedUrl.match(/^(javascript|data):/i)) {
        alert(t("tiptap_invalid_link"));
        return;
      }

      if (!trimmedUrl.match(/^https?:\/\//i)) {
        finalUrl = `http://${trimmedUrl}`;
      }

      try {
        new URL(finalUrl);
      } catch (e) {
        alert(t("tiptap_invalid_link"));
        return;
      }

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      const linkDisplayText = trimmedText || selectedText || finalUrl;

      if (selectedText && selectedText.trim().length > 0) {
        editor
          .chain()
          .focus()
          .deleteSelection()
          .insertContent(`<a href="${finalUrl}">${linkDisplayText}</a>`)
          .run();
      } else if (trimmedText) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${finalUrl}">${linkDisplayText}</a>`)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: finalUrl })
          .run();
      }
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
  }, [editor, linkUrl, linkText, t]);

  const toggleLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    if (previousUrl) {
      // Remove link and ensure cursor is positioned outside link mark
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .removeMark("link")
        .setTextSelection({ from: to, to: to })
        .run();
    } else {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      const currentUrl = editor.getAttributes("link").href || "";
      setLinkUrl(currentUrl);
      setLinkText(selectedText || "");
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
        alert(t("tiptap_invalid_file_type"));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(t("tiptap_file_too_large"));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const surveyId = sessionStorage.getItem("surveyId");
      if (!surveyId) {
        alert("No survey selected. Please select a survey first.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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
        console.error("Image upload failed:", error);
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, designService, t]
  );

  const insertCollapsible = useCallback(() => {
    // Don't allow inserting collapsible inside another collapsible
    if (editor.isActive("collapsible")) {
      return;
    }

    // Clear any selection to ensure buttonText doesn't get inserted into content
    editor
      .chain()
      .focus()
      .setCollapsible({
        open: false,
        buttonText: t("tiptap_collapsible_title_placeholder"),
        backgroundColor: null,
        textColor: null,
        content: [
          {
            type: "paragraph",
          },
        ],
      })
      .run();
  }, [editor]);

  const updateCollapsible = useCallback(() => {
    if (!editor.isActive("collapsible")) {
      return;
    }

    const attrs = {};
    if (collapsibleTitle.trim()) {
      attrs.buttonText = collapsibleTitle.trim();
    }
    attrs.backgroundColor = collapsibleBgColor.trim() || null;
    attrs.textColor = collapsibleTextColor.trim() || null;

    editor.chain().focus().updateCollapsible(attrs).run();
  }, [editor, collapsibleTitle, collapsibleBgColor, collapsibleTextColor]);

  const toggleCollapsibleInput = useCallback(() => {
    if (editor.isActive("collapsible")) {
      const attrs = editor.getAttributes("collapsible");
      setCollapsibleTitle(
        attrs.buttonText || t("tiptap_collapsible_title_placeholder")
      );
      setCollapsibleBgColor(attrs.backgroundColor || "");
      setCollapsibleTextColor(attrs.textColor || "");
      setShowCollapsibleInput(!showCollapsibleInput);
    }
  }, [editor, showCollapsibleInput]);

  const updateImageSize = useCallback(() => {
    if (!editor.isActive("image")) {
      return;
    }

    const attrs = {};
    // Set width - use null to remove attribute if empty
    attrs.width = imageWidth.trim() || null;
    // Set height - use null to remove attribute if empty
    attrs.height = imageHeight.trim() || null;

    editor.chain().focus().updateAttributes("image", attrs).run();
  }, [editor, imageWidth, imageHeight]);

  const getImageElement = useCallback(() => {
    try {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node && node.type.name === "image") {
        const domAtPos = editor.view.domAtPos(from);
        let imageElement = null;

        if (domAtPos.node) {
          if (domAtPos.node.tagName) {
            if (domAtPos.node.tagName === "IMG") {
              imageElement = domAtPos.node;
            } else {
              imageElement = domAtPos.node.querySelector?.("img");
              if (!imageElement && domAtPos.node.parentElement) {
                imageElement =
                  domAtPos.node.parentElement.querySelector?.("img");
              }
            }
          }
        }

        if (!imageElement && editor.view.dom) {
          const editorDom = editor.view.dom;
          const images = editorDom.querySelectorAll("img");
          const attrs = editor.getAttributes("image");
          if (images.length > 0 && attrs.src) {
            imageElement = Array.from(images).find(
              (img) =>
                img.src === attrs.src || img.getAttribute("src") === attrs.src
            );
          }
          if (!imageElement && images.length > 0) {
            imageElement = images[0];
          }
        }

        return imageElement;
      }
    } catch (error) {
      // Fallback
    }
    return null;
  }, [editor]);

  const getNaturalAspectRatio = useCallback(() => {
    const imageElement = getImageElement();
    if (imageElement) {
      const naturalWidth = imageElement.naturalWidth || 0;
      const naturalHeight = imageElement.naturalHeight || 0;
      if (naturalWidth > 0 && naturalHeight > 0) {
        return naturalWidth / naturalHeight;
      }
    }
    return null;
  }, [getImageElement]);

  const getImageDimensions = useCallback(() => {
    const attrs = editor.getAttributes("image");
    let width = attrs.width || "";
    let height = attrs.height || "";

    // If attributes are not set, get the actual rendered dimensions from the DOM
    if (!width || !height) {
      const imageElement = getImageElement();
      if (imageElement) {
        // Use offsetWidth/offsetHeight for rendered size, fallback to naturalWidth/naturalHeight
        if (!width) {
          const renderedWidth =
            imageElement.offsetWidth || imageElement.naturalWidth || 0;
          width = renderedWidth > 0 ? renderedWidth.toString() : "";
        }
        if (!height) {
          const renderedHeight =
            imageElement.offsetHeight || imageElement.naturalHeight || 0;
          height = renderedHeight > 0 ? renderedHeight.toString() : "";
        }
      }
    }

    // Calculate aspect ratio from natural dimensions (original image aspect ratio)
    const naturalRatio = getNaturalAspectRatio();
    if (naturalRatio) {
      aspectRatioRef.current = naturalRatio;
    } else if (width && height) {
      // Fallback to current dimensions if natural dimensions aren't available
      const widthNum = parseFloat(width);
      const heightNum = parseFloat(height);
      if (widthNum > 0 && heightNum > 0) {
        aspectRatioRef.current = widthNum / heightNum;
      }
    }

    return { width, height };
  }, [editor, getImageElement, getNaturalAspectRatio]);

  const toggleImageSizeInput = useCallback(() => {
    if (editor.isActive("image")) {
      const { width, height } = getImageDimensions();
      setImageWidth(width);
      setImageHeight(height);

      // Aspect ratio is already calculated in getImageDimensions from natural dimensions
      setShowImageSizeInput(!showImageSizeInput);
    }
  }, [editor, showImageSizeInput, getImageDimensions]);

  const handleWidthChange = useCallback(
    (newWidth) => {
      setImageWidth(newWidth);

      // If aspect ratio is maintained and we have a valid aspect ratio, update height
      if (maintainAspectRatio && aspectRatioRef.current && newWidth.trim()) {
        const widthNum = parseFloat(newWidth);
        if (!isNaN(widthNum) && widthNum > 0) {
          const newHeight = Math.round(widthNum / aspectRatioRef.current);
          setImageHeight(newHeight.toString());
        }
      }
    },
    [maintainAspectRatio]
  );

  const handleHeightChange = useCallback(
    (newHeight) => {
      setImageHeight(newHeight);

      // If aspect ratio is maintained and we have a valid aspect ratio, update width
      if (maintainAspectRatio && aspectRatioRef.current && newHeight.trim()) {
        const heightNum = parseFloat(newHeight);
        if (!isNaN(heightNum) && heightNum > 0) {
          const newWidth = Math.round(heightNum * aspectRatioRef.current);
          setImageWidth(newWidth.toString());
        }
      }
    },
    [maintainAspectRatio]
  );

  const handleAspectRatioToggle = useCallback(
    (enabled) => {
      setMaintainAspectRatio(enabled);

      if (enabled) {
        const naturalRatio = getNaturalAspectRatio();
        if (naturalRatio) {
          aspectRatioRef.current = naturalRatio;
        } else {
          let width = imageWidth;
          let height = imageHeight;

          if (!width || !height) {
            const attrs = editor.getAttributes("image");
            width = attrs.width || "";
            height = attrs.height || "";
          }

          if (width && height) {
            const widthNum = parseFloat(width);
            const heightNum = parseFloat(height);
            if (
              !isNaN(widthNum) &&
              !isNaN(heightNum) &&
              widthNum > 0 &&
              heightNum > 0
            ) {
              aspectRatioRef.current = widthNum / heightNum;
            }
          }
        }
      }
    },
    [imageWidth, imageHeight, editor, getNaturalAspectRatio]
  );

  // Ensure aspect ratio is set from natural dimensions when toggle is enabled
  useEffect(() => {
    if (maintainAspectRatio && editor.isActive("image")) {
      const naturalRatio = getNaturalAspectRatio();
      if (naturalRatio) {
        aspectRatioRef.current = naturalRatio;
      }
    }
  }, [maintainAspectRatio, editor, getNaturalAspectRatio]);

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
      if (
        imageSizeInputRef.current &&
        !imageSizeInputRef.current.contains(event.target) &&
        !event.target.closest('button[title="Image Size"]') &&
        !event.target.closest('input[type="checkbox"]') &&
        event.target.type !== "checkbox"
      ) {
        setShowImageSizeInput(false);
      }
      if (
        collapsibleInputRef.current &&
        !collapsibleInputRef.current.contains(event.target) &&
        !event.target.closest('button[title="Collapsible Settings"]')
      ) {
        setShowCollapsibleInput(false);
      }
      if (
        collapsibleColorPickerRef.current &&
        !collapsibleColorPickerRef.current.contains(event.target) &&
        !event.target.closest(".tiptap-collapsible-color-picker-wrapper")
      ) {
        setShowCollapsibleColorPicker(false);
      }
      if (
        collapsibleTextColorPickerRef.current &&
        !collapsibleTextColorPickerRef.current.contains(event.target) &&
        !event.target.closest(".tiptap-collapsible-text-color-picker-wrapper")
      ) {
        setShowCollapsibleTextColorPicker(false);
      }
    };

    if (
      showColorPicker ||
      showBgColorPicker ||
      showLinkInput ||
      showImageSizeInput ||
      showCollapsibleInput ||
      showCollapsibleColorPicker ||
      showCollapsibleTextColorPicker
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [
    showColorPicker,
    showBgColorPicker,
    showLinkInput,
    showImageSizeInput,
    showCollapsibleInput,
    showCollapsibleColorPicker,
    showCollapsibleTextColorPicker,
  ]);

  useEffect(() => {
    if (showLinkInput) {
      const currentUrl = editor.getAttributes("link").href || "";
      if (currentUrl && !linkUrl) {
        setLinkUrl(currentUrl);
      }
    } else {
      // Clear inputs when closing
      setLinkUrl("");
      setLinkText("");
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
        title={t("tiptap_bold")}
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
        title={t("tiptap_italic")}
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
        title={t("tiptap_underline")}
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
        title={t("tiptap_strikethrough")}
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
        title={t("tiptap_link")}
      >
        🔗
      </button>

      {showLinkInput && (
        <div className="tiptap-link-input" ref={linkInputRef}>
          <input
            type="text"
            placeholder={t("tiptap_link_text_placeholder")}
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (linkText.trim() && linkUrl.trim()) {
                  setLink();
                } else {
                  document
                    .querySelector('.tiptap-link-input input[type="url"]')
                    ?.focus();
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setShowLinkInput(false);
                setLinkUrl("");
                setLinkText("");
                editor.commands.focus();
              }
            }}
            autoFocus
          />
          <input
            type="url"
            placeholder={t("tiptap_link_placeholder")}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (linkText.trim() && linkUrl.trim()) {
                  setLink();
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setShowLinkInput(false);
                setLinkUrl("");
                setLinkText("");
                editor.commands.focus();
              }
            }}
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={setLink}
            disabled={!linkText.trim() || !linkUrl.trim()}
          >
            {t("ok")}
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
              setLinkText("");
              editor.commands.focus();
            }}
          >
            {t("cancel")}
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
            title={t("tiptap_ordered_list")}
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
            title={t("tiptap_bullet_list")}
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
            title={t("tiptap_decrease_indent")}
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
            title={t("tiptap_increase_indent")}
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
          title={t("tiptap_text_color")}
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
              title={t("tiptap_remove_color")}
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
          title={t("tiptap_background_color")}
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
              title={t("tiptap_remove_background")}
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
            title={t("tiptap_insert_image")}
          >
            {isUploadingImage ? (
              <LoadingDots />
            ) : (
              <PhotoIcon style={{ fontSize: "16px" }} />
            )}
          </span>
        </label>
      </div>

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
          {showImageSizeInput && (
            <div className="tiptap-image-size-input" ref={imageSizeInputRef}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {/* Aspect Ratio Toggle */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <input
                    type="checkbox"
                    checked={maintainAspectRatio}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleAspectRatioToggle(e.target.checked);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  <span>{t("tiptap_maintain_aspect_ratio")}</span>
                </label>

                {/* Width and Height Inputs */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    alignItems: "center",
                  }}
                >
                  <label style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {t("tiptap_width")}:
                  </label>
                  <input
                    type="text"
                    placeholder={t("tiptap_width")}
                    value={imageWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        updateImageSize();
                        setShowImageSizeInput(false);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setShowImageSizeInput(false);
                        editor.commands.focus();
                      }
                    }}
                  />
                  <label style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {t("tiptap_height")}:
                  </label>
                  <input
                    type="text"
                    placeholder={t("tiptap_height")}
                    value={imageHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        updateImageSize();
                        setShowImageSizeInput(false);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setShowImageSizeInput(false);
                        editor.commands.focus();
                      }
                    }}
                  />
                </div>

                {/* Action Buttons */}
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
                      updateImageSize();
                      setShowImageSizeInput(false);
                    }}
                  >
                    {t("ok")}
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowImageSizeInput(false);
                      editor.commands.focus();
                    }}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
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
          {showCollapsibleInput && (
            <div className="tiptap-collapsible-input" ref={collapsibleInputRef}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {/* Title Input */}
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
                        updateCollapsible();
                        setShowCollapsibleInput(false);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setShowCollapsibleInput(false);
                        editor.commands.focus();
                      }
                    }}
                  />
                </div>

                {/* Background Color Picker */}
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
                      onClick={() =>
                        setShowCollapsibleColorPicker(
                          !showCollapsibleColorPicker
                        )
                      }
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
                        className="tiptap-color-palette"
                        ref={collapsibleColorPickerRef}
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: "0.25rem",
                        }}
                      >
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="tiptap-color-option"
                            style={{ backgroundColor: color }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setCollapsibleBgColor(color);
                              setShowCollapsibleColorPicker(false);
                            }}
                            title={color}
                          />
                        ))}
                        <button
                          className="tiptap-color-option tiptap-color-remove"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCollapsibleBgColor("");
                            setShowCollapsibleColorPicker(false);
                          }}
                          title={t("tiptap_remove_color")}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Color Picker */}
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
                      onClick={() =>
                        setShowCollapsibleTextColorPicker(
                          !showCollapsibleTextColorPicker
                        )
                      }
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
                        className="tiptap-color-palette"
                        ref={collapsibleTextColorPickerRef}
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: "0.25rem",
                        }}
                      >
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="tiptap-color-option"
                            style={{ backgroundColor: color }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setCollapsibleTextColor(color);
                              setShowCollapsibleTextColorPicker(false);
                            }}
                            title={color}
                          />
                        ))}
                        <button
                          className="tiptap-color-option tiptap-color-remove"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCollapsibleTextColor("");
                            setShowCollapsibleTextColorPicker(false);
                          }}
                          title={t("tiptap_remove_color")}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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
                      updateCollapsible();
                      setShowCollapsibleInput(false);
                    }}
                  >
                    {t("ok")}
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowCollapsibleInput(false);
                      editor.commands.focus();
                    }}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
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
