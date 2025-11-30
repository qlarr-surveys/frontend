import {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { useService } from "~/hooks/use-service";
import { buildResourceUrl } from "~/networking/common";
import { EDITOR_CONSTANTS } from "~/constants/editor";

export const useToolbar = ({ editor, code }) => {
  const { t } = useTranslation("design");
  const designService = useService("design");

  // State
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
  const [showCollapsibleColorPicker, setShowCollapsibleColorPicker] =
    useState(false);
  const [showCollapsibleTextColorPicker, setShowCollapsibleTextColorPicker] =
    useState(false);

  // Refs
  const aspectRatioRef = useRef(null);
  const colorPickerRef = useRef(null);
  const bgColorPickerRef = useRef(null);

  // Memoized values
  const fontSizes = useMemo(
    () => [
      {
        label: t("tiptap_font_size_small"),
        value: EDITOR_CONSTANTS.FONT_SIZE_VALUES[0],
      },
      {
        label: t("tiptap_font_size_normal"),
        value: EDITOR_CONSTANTS.FONT_SIZE_VALUES[1],
      },
      {
        label: t("tiptap_font_size_large"),
        value: EDITOR_CONSTANTS.FONT_SIZE_VALUES[2],
      },
      {
        label: t("tiptap_font_size_huge"),
        value: EDITOR_CONSTANTS.FONT_SIZE_VALUES[3],
      },
    ],
    [t]
  );

  const colors = useMemo(() => EDITOR_CONSTANTS.COLOR_PALETTE, []);

  // Methods
  const setFontSize = useCallback(
    (size) => {
      editor?.chain().focus().setFontSize(size).run();
    },
    [editor]
  );

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
        return;
      }

      if (file.size > EDITOR_CONSTANTS.MAX_IMAGE_SIZE) {
        alert(t("tiptap_file_too_large"));
        return;
      }

      const surveyId = sessionStorage.getItem("surveyId");
      if (!surveyId) {
        alert("No survey selected. Please select a survey first.");
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
        if (process.env.NODE_ENV === "development") {
          console.error("Image upload failed:", error);
        }
        let errorMessage = "Failed to upload image. Please try again.";

        if (error?.response?.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error?.response?.status === 403) {
          errorMessage = "You don't have permission to upload images.";
        } else if (error?.response?.status === 413) {
          errorMessage = "File is too large. Please select a smaller image.";
        } else if (error?.response?.status === 400) {
          errorMessage = "Invalid file. Please select a valid image file.";
        } else if (error?.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.code === "ERR_NETWORK") {
          errorMessage = "Network error. Please check your internet connection.";
        }

        alert(errorMessage);
      } finally {
        setIsUploadingImage(false);
      }
    },
    [editor, designService, t]
  );

  const insertCollapsible = useCallback(() => {
    if (editor.isActive("collapsible")) {
      return;
    }

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
  }, [editor, t]);

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
      setShowCollapsibleInput((prev) => !prev);
    }
  }, [editor, t]);

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

    if (!width || !height) {
      const imageElement = getImageElement();
      if (imageElement) {
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

    const naturalRatio = getNaturalAspectRatio();
    if (naturalRatio) {
      aspectRatioRef.current = naturalRatio;
    } else if (width && height) {
      const widthNum = parseFloat(width);
      const heightNum = parseFloat(height);
      if (widthNum > 0 && heightNum > 0) {
        aspectRatioRef.current = widthNum / heightNum;
      }
    }

    return { width, height };
  }, [editor, getImageElement, getNaturalAspectRatio]);

  const updateImageSize = useCallback(() => {
    if (!editor.isActive("image")) {
      return;
    }

    const attrs = {};
    attrs.width = imageWidth.trim() || null;
    attrs.height = imageHeight.trim() || null;

    editor.chain().focus().updateAttributes("image", attrs).run();
  }, [editor, imageWidth, imageHeight]);

  const toggleImageSizeInput = useCallback(() => {
    if (editor.isActive("image")) {
      const { width, height } = getImageDimensions();
      setImageWidth(width);
      setImageHeight(height);

      setShowImageSizeInput((prev) => !prev);
    }
  }, [editor, getImageDimensions]);

  const handleWidthChange = useCallback(
    (newWidth) => {
      setImageWidth(newWidth);

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

  // Sync editor state with component state
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
        if (!showImageSizeInput) {
          let width = attrs.width || "";
          let height = attrs.height || "";

          if (!width || !height) {
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
                  if (images.length > 0 && attrs.src) {
                    imageElement = Array.from(images).find(
                      (img) =>
                        img.src === attrs.src ||
                        img.getAttribute("src") === attrs.src
                    );
                  }
                  if (!imageElement && images.length > 0) {
                    imageElement = images[0];
                  }
                }

                if (imageElement) {
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

          if (width && height) {
            const widthNum = parseFloat(width);
            const heightNum = parseFloat(height);
            if (widthNum > 0 && heightNum > 0) {
              aspectRatioRef.current = widthNum / heightNum;
            }
          }
        }
      } else {
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
  }, [editor, showImageSizeInput, showCollapsibleInput, fontSizes, t]);

  // Ensure aspect ratio is set from natural dimensions when toggle is enabled
  useEffect(() => {
    if (maintainAspectRatio && editor?.isActive("image")) {
      const naturalRatio = getNaturalAspectRatio();
      if (naturalRatio) {
        aspectRatioRef.current = naturalRatio;
      }
    }
  }, [maintainAspectRatio, editor, getNaturalAspectRatio]);

  // Handle click outside for popups
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
    };

    if (showColorPicker || showBgColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showColorPicker, showBgColorPicker]);

  return {
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
    fontSizes,
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
  };
};

