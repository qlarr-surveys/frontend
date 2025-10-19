import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import { manageStore } from "~/store";
import { buildReferences } from "~/components/Questions/buildReferences";
import { sanitizePastedText } from "../QuillEditor";
import Toolbar from "./Toolbar";
import suggestion from "./suggestion";
import "tippy.js/dist/tippy.css";
import "./TipTapEditor.css";

// Custom extension for font size
import { Extension } from "@tiptap/core";

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle()
            .run();
        },
    };
  },
});

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
  console.debug("TipTap DraftEditor for: " + code);

  const editorRef = useRef(null);
  const wrapperRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Get references for mentions
  const getMentionSuggestions = useCallback(
    async (query) => {
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
    },
    [code]
  );

  // Configure TipTap extensions
  const extensions = useMemo(() => {
    return [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: "margin: 0;",
          },
        },
        heading: false, // Disable headings since we're using font sizes
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
        },
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
        renderHTML({ node, HTMLAttributes }) {
          const { id, label } = node.attrs;
          const type = node.attrs["data-type"] || "";

          // Apply reference instruction replacement if available
          let displayText = `{{${id}:${type}}}`;
          if (referenceInstruction && referenceInstruction[id]) {
            displayText = displayText.replace(
              new RegExp(`{{${id}:`, "g"),
              `{{${referenceInstruction[id]}:`
            );
          }

          return [
            "span",
            {
              ...HTMLAttributes,
              "data-id": id,
              "data-type": type,
              "data-value": `{{${id}:${type}}}`,
            },
            [
              "span",
              {
                contenteditable: "false",
              },
              displayText,
            ],
          ];
        },
      }),
    ];
  }, [getMentionSuggestions, referenceInstruction]);

  // Initialize editor
  const editor = useEditor({
    extensions,
    content: value || "",
    editorProps: {
      attributes: {
        class: `tiptap-editor ${isRtl ? "rtl" : "ltr"}`,
      },
      handlePaste: (view, event) => {
        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return true;

        const sanitizedLines = sanitizePastedText(text);
        const firstLine = sanitizedLines[0] || "";
        const restLines = sanitizedLines.slice(1);

        // Insert first line at cursor
        const { state, dispatch } = view;
        const { selection } = state;
        const transaction = state.tr.insertText(firstLine, selection.from, selection.to);
        dispatch(transaction);

        // Handle additional lines
        if (typeof onMoreLines === "function" && restLines.length > 0) {
          onMoreLines(restLines);
        }

        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      // Handle new line in single-line mode
      if (!extended && onNewLine) {
        const currentValue = editorRef.current || "";
        if (html !== "<p></p>" && html.endsWith("<p></p>") && !currentValue.endsWith("<p></p>")) {
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
    },
    onBlur: () => {
      // Use a short timeout to check if focus moved to toolbar or stayed within editor
      blurTimeoutRef.current = setTimeout(() => {
        const activeElement = document.activeElement;

        // Check if focus moved to an element within our wrapper (toolbar, color picker, etc.)
        if (wrapperRef.current && wrapperRef.current.contains(activeElement)) {
          // Focus is still within the editor wrapper, don't fire blur listener
          return;
        }

        // Focus moved outside the editor, fire the blur listener
        const currentHtml = editor?.getHTML() || "";
        onBlurListener(currentHtml, lang);
      }, 0);
    },
  });

  // Set focus when editor is ready
  useEffect(() => {
    if (editor) {
      // Focus at end of content
      editor.commands.focus("end");
    }
  }, [editor]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      editor?.destroy();
    };
  }, [editor]);

  const handleContainerClick = (e) => {
    if (e.target.tagName === "A" && e.target.className === "tiptap-link") {
      e.preventDefault();
      window.open(e.target.href, "_blank");
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className={`tiptap-wrapper ${editorTheme}`}
      onClick={handleContainerClick}
    >
      <EditorContent editor={editor} />
      {editorTheme === "snow" && <Toolbar editor={editor} extended={extended} />}
    </div>
  );
}

export default React.memo(DraftEditor);
