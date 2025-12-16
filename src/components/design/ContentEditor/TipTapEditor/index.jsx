import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { sanitizePastedText } from "../sanitizePastedText";
import Toolbar from "./Toolbar";
import CollapsibleSettings from "./CollapsibleSettings";
import { buildReferences } from "~/components/Questions/buildReferences";
import { manageStore } from "~/store";
import "./TipTapEditor.css";
import { EDITOR_CONSTANTS } from "~/constants/editor";
import { createAllExtensions } from "./extensions";

const { BLUR_TIMEOUT_MS, CONTENT_SYNC_TIMEOUT_MS } = EDITOR_CONSTANTS;

function TipTapEditor({
  value,
  onBlurListener,
  extended,
  isRtl,
  lang,
  onNewLine,
  onMoreLines,
  code,
  showToolbar = true,
  referenceInstruction = {},
}) {
  const editorRef = useRef(null);
  const wrapperRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isFocused, setIsFocused] = useState(false);

  const [showCollapsibleSettings, setShowCollapsibleSettings] = useState(false);
  const [collapsibleSettingsPosition, setCollapsibleSettingsPosition] =
    useState(null);
  const [collapsibleSettingsAttrs, setCollapsibleSettingsAttrs] =
    useState(null);
  const [collapsibleSettingsPos, setCollapsibleSettingsPos] = useState(null);

  const getMentionSuggestions = useCallback(
    (query) => {
      const designState = manageStore.getState().designState;
      const values = buildReferences(
        designState.componentIndex,
        code,
        designState,
        designState.langInfo.mainLang
      );

      if (query.length === 0) {
        return values;
      }

      const matches = [];
      for (let i = 0; i < values.length; i++) {
        if (values[i].value.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          matches.push(values[i]);
        }
      }
      return matches;
    },
    [code]
  );

  const extensions = useMemo(() => {
    return createAllExtensions({
      getMentionSuggestions,
      referenceInstruction,
    });
  }, [getMentionSuggestions, referenceInstruction]);

  const editor = useEditor({
    extensions,
    content: value || "",
    editorProps: {
      attributes: {
        class: `tiptap-editor ${isRtl ? "rtl" : "ltr"}`,
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!text) {
          return false;
        }

        event.preventDefault();
        const sanitizedLines = sanitizePastedText(text);
        const firstLine = sanitizedLines[0] || "";
        const restLines = sanitizedLines.slice(1);

        const { state, dispatch } = view;
        const { selection } = state;
        const transaction = state.tr.insertText(
          firstLine,
          selection.from,
          selection.to
        );
        dispatch(transaction);

        if (typeof onMoreLines === "function" && restLines.length > 0) {
          onMoreLines(restLines);
        }

        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      if (!extended && onNewLine) {
        const currentValue = editorRef.current || "";
        if (
          html !== "<p></p>" &&
          html.endsWith("<p></p>") &&
          !currentValue.endsWith("<p></p>")
        ) {
          onNewLine(html);
          return;
        }
      }

      editorRef.current = html;
    },
    onFocus: () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsFocused(true);
    },
    onBlur: () => {
      blurTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) {
          return;
        }

        const activeElement = document.activeElement;

        if (wrapperRef.current && wrapperRef.current.contains(activeElement)) {
          if (editor?.isFocused) {
            setIsFocused(true);
          }
          return;
        }

        if (
          activeElement &&
          activeElement.tagName === "INPUT" &&
          activeElement.type === "file"
        ) {
          return;
        }

        setIsFocused(false);
        const currentHtml = editor?.getHTML() || "";
        onBlurListener(currentHtml, lang);
      }, BLUR_TIMEOUT_MS);
    },
  });

  useEffect(() => {
    const handleCollapsibleSettingsClick = (e) => {
      const { pos, attrs, buttonRect } = e.detail;
      setCollapsibleSettingsPos(pos);
      setCollapsibleSettingsAttrs(attrs);
      setCollapsibleSettingsPosition(buttonRect);
      setShowCollapsibleSettings(true);
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener(
        "collapsible-settings-click",
        handleCollapsibleSettingsClick
      );
      return () => {
        wrapper.removeEventListener(
          "collapsible-settings-click",
          handleCollapsibleSettingsClick
        );
      };
    }
  }, []);

  // Handle collapsible settings update
  const handleCollapsibleUpdate = useCallback(
    (attrs) => {
      if (editor && collapsibleSettingsPos !== null) {
        editor.commands.command(({ tr, dispatch }) => {
          const nodeAtPos = tr.doc.nodeAt(collapsibleSettingsPos);
          if (nodeAtPos && nodeAtPos.type.name === "collapsible") {
            if (dispatch) {
              tr.setNodeMarkup(collapsibleSettingsPos, undefined, {
                ...nodeAtPos.attrs,
                ...attrs,
              });
            }
            return true;
          }
          return false;
        });
      }
    },
    [editor, collapsibleSettingsPos]
  );

  const handleCloseCollapsibleSettings = useCallback(() => {
    setShowCollapsibleSettings(false);
    setCollapsibleSettingsPosition(null);
    setCollapsibleSettingsAttrs(null);
    setCollapsibleSettingsPos(null);
  }, []);

  useEffect(() => {
    if (editor && !editorRef.current) {
      const currentContent = editor.getHTML();
      if (!currentContent || currentContent === "<p></p>") {
        editor.commands.focus("end");
      }
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.commands.focus("end");
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.isFocused) {
      return;
    }

    const currentContent = editor.getHTML();
    const normalizedValue = value || "";
    const normalizedCurrent =
      currentContent === "<p></p>" ? "" : currentContent;

    if (normalizedValue === normalizedCurrent) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!editor || editor.isDestroyed) {
        return;
      }

      if (editor.isFocused) {
        return;
      }

      const finalCurrentContent = editor.getHTML();
      const finalNormalizedCurrent =
        finalCurrentContent === "<p></p>" ? "" : finalCurrentContent;

      if (normalizedValue !== finalNormalizedCurrent) {
        editor.commands.setContent(normalizedValue);
      }
    }, CONTENT_SYNC_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, editor]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className={`tiptap-wrapper ${isFocused ? "tiptap-focused" : ""}`}
    >
      <EditorContent editor={editor} />
      {showToolbar && isFocused && (
        <Toolbar editor={editor} extended={extended} />
      )}
      <CollapsibleSettings
        show={showCollapsibleSettings && isFocused}
        position={collapsibleSettingsPosition}
        collapsibleAttrs={collapsibleSettingsAttrs}
        onUpdate={handleCollapsibleUpdate}
        onClose={handleCloseCollapsibleSettings}
        editor={editor}
      />
    </div>
  );
}

export default React.memo(TipTapEditor);
