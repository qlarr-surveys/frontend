import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "./LinkExtension";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import { manageStore } from "~/store";
import { buildReferences } from "~/components/Questions/buildReferences";
import { sanitizePastedText } from "../sanitizePastedText";
import Toolbar from "./Toolbar";
import suggestion from "./suggestion";
import ImageExtension from "./ImageExtension";
import CollapsibleExtension from "./CollapsibleExtension";
import FontSize from "./FontSizeExtension";
import "tippy.js/dist/tippy.css";
import "./TipTapEditor.css";

function DraftEditor({
  value,
  onBlurListener,
  extended,
  isRtl,
  lang,
  onNewLine,
  onMoreLines,
  code,
  editorTheme = "snow",
  referenceInstruction = {},
}) {
  const editorRef = useRef(null);
  const wrapperRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isFocused, setIsFocused] = React.useState(false);

  const getMentionSuggestions = useCallback(
    async (query) => {
      try {
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

        return values.filter((item) =>
          item.value.toLowerCase().includes(query.toLowerCase())
        );
      } catch (error) {
        console.error("Error getting mention suggestions:", error);
        return [];
      }
    },
    [code]
  );

  const extensions = useMemo(() => {
    return [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: "margin: 0;",
          },
        },
        heading: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
        },
        autolink: false,
      }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: suggestion(getMentionSuggestions, referenceInstruction),
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      CollapsibleExtension,
    ];
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
      }, 100);
    },
  });

  useEffect(() => {
    if (editor && !editorRef.current) {
      const currentContent = editor.getHTML();
      if (!currentContent || currentContent === "<p></p>") {
        editor.commands.focus("end");
      }
    }
  }, [editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (!editor.isFocused) {
        const timeoutId = setTimeout(() => {
          if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
          }
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }
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
    <div ref={wrapperRef} className={`tiptap-wrapper ${editorTheme}`}>
      <EditorContent editor={editor} />
      {editorTheme === "snow" && isFocused && (
        <Toolbar editor={editor} extended={extended} code={code} />
      )}
    </div>
  );
}

export default React.memo(DraftEditor);
