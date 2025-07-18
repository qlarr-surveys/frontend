import React, { useEffect, useMemo, useState } from "react";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import ReactQuill, { Quill } from "react-quill";
import Delta from "quill-delta";
import QuillMention from "quill-mention";
import "quill-mention/dist/quill.mention.css";
import { manageStore } from "~/store";
import { SurveyFormClipboard } from "./SurveyFormClipboard";
import { buildReferences } from "~/components/Questions/buildReferences";

// Define the module class before using it
class MentionDisplayModule {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options || {};

    // Update display after any change
    quill.on("text-change", () => {
      setTimeout(() => this.updateMentionDisplay(), 0);
    });

    // Initial update
    setTimeout(() => this.updateMentionDisplay(), 0);
  }

  updateMentionDisplay() {
    const mentions = this.quill.container.querySelectorAll(
      '.mention span[contenteditable="false"]'
    );

    mentions.forEach((mention) => {
      const parentMention = mention.closest(".mention");
      const id = parentMention?.getAttribute("data-id");
      const type = parentMention?.getAttribute("data-type");

      // Don't modify if already processed
      if (mention.getAttribute("data-display-processed")) return;

      // Your replacement logic
      const displayText = this.getDisplayText(id, mention.textContent);
      if (displayText) {
        mention.textContent = displayText;
        mention.setAttribute("data-display-processed", "true");
      }
    });
  }

  getDisplayText(id, textContent) {
    if (this.options.referenceInstruction[id]) {
      return textContent.replaceAll(id, this.options.referenceInstruction[id]);
    }
    return textContent;
  }
}

Quill.register("modules/mentions", QuillMention);
Quill.register("modules/clipboard", SurveyFormClipboard, true);
Quill.register("modules/mentionDisplay", MentionDisplayModule);

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
  referenceInstruction = [],
}) {
  console.debug("DraftEditor for: " + code);

  const oneLine = (value, oneLine) => {
    return !oneLine
      ? value
      : "<p>" +
          value
            .replace(/<br>/gi, "")
            .replace(/<p>/gi, "")
            .replace(/<\/p>/, "") +
          "</p>";
  };
  const editor = React.createRef();
  const [state, setState] = useState(oneLine(value, !extended));
  const [lastFocus, setLastFocus] = useState(0);

  async function references(searchTerm) {
    const designState = manageStore.getState().designState;
    const values = buildReferences(
      designState.componentIndex,
      code,
      designState,
      designState.langInfo.mainLang
    );
    if (searchTerm.length === 0) {
      return values;
    } else {
      const matches = [];
      for (var i = 0; i < values.length; i++) {
        if (
          values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0
        ) {
          matches.push(values[i]);
        }
      }
      return matches;
    }
  }

  useEffect(() => {
    const quill = editor.current.getEditor();
    quill.setSelection(quill.getLength(), 0);
  }, [editor.current]);

  const modules = useMemo(() => {
    return {
      mention: {
        dataAttributes: ["instruction", "type"],
        isolateCharacter: true,
        allowedChars: /[^\p{L}\p{N}]*$/,
        mentionDenotationChars: ["@"],
        showDenotationChar: false,
        onSelect: function (item, insertItem) {
          insertItem({ ...item, value: `{{${item.id}:${item.type}}}` });
        },
        source: async function (searchTerm, renderList) {
          const values = await references(searchTerm);
          renderList(values);
        },
      },
      toolbar: {
        container: extended
          ? [
              [{ size: ["small", false, "large", "huge"] }],
              ["bold", "italic", "underline", "strike", "link"],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              [{ color: [] }, { background: [] }],
              ["clean"],
            ]
          : [
              [{ size: ["small", false, "large", "huge"] }],
              ["bold", "italic", "underline", "strike", "link"],
              [{ color: [] }, { background: [] }],
              ["clean"],
            ],

        // handlers: {
        //   // handlers object will be merged with default handlers object
        //   link: function (value) {
        //     if (value) {
        //       var href = prompt("Enter the URL");
        //       this.quill.format("link", href);
        //     } else {
        //       this.quill.format("link", false);
        //     }
        //   },
        // },
      },
      mentionDisplay: {
        referenceInstruction: referenceInstruction,
      },
      clipboard: {
        onPasteCallback: function (pasteData) {
          const quill = this.quill;
          const range = quill.getSelection();
          const sanitizedText = sanitizePastedText(pasteData);
          const text = sanitizedText[0];
          const rest = sanitizedText.slice(1);
          if (typeof onMoreLines === "function" && rest.length > 0) {
            console.log("onMoreLines", text);
            const delta = new Delta()
              .retain(range.index)
              .delete(range.length)
              .insert(text);
            quill.updateContents(delta, "silent");
            
            if (rest.length > 0) {
              onMoreLines(rest);
            }
          } else {
            console.log("pasteData", pasteData);
            const delta = new Delta()
              .retain(range.index)
              .delete(range.length)
              .insert(pasteData);
            const index = pasteData.length + range.index;
            const length = pasteData.length;
            quill.updateContents(delta, "silent");
            quill.setSelection(index, length, "silent");
          }
          // Your custom logic here
        },
        // Add the clipboard module with paste and matchVisual options
        matchVisual: false, // Disable matching visual formatting during paste
      },
    };
  }, []);

  const formats = [
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "direction",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "mention",
    "link",
  ];
  let timeoutID = null;

  const onFocus = () => {
    setLastFocus(Date.now());
    timeoutID && clearTimeout(timeoutID);
  };
  const onBlur = () => {
    timeoutID = setTimeout(() => {
      onBlurListener(state, lang);
    }, 500);
  };

  const onChange = (value) => {
    console.log("onChange", value);
    onFocus();
    if(!extended && onNewLine && value!="<p><br></p>" && value.endsWith("<p><br></p>")) {
      onNewLine(value);
    } else {
      setState(oneLine(value, !extended));
    }
  };

  const onContainerClick = (e) => {
    if (e.target.tagName === "A" && e.target.className == "ql-preview") {
      e.preventDefault();
      window.open(e.target.href, "_blank");
    }
  };

  return (
    <div
      onClick={onContainerClick}
      className="quill-wrapper"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <ReactQuill
        className={isRtl ? "rtl" : "ltr"}
        theme={editorTheme}
        bounds={".quill-wrapper"}
        ref={editor}
        modules={modules}
        formats={formats}
        value={state}
        onChange={onChange}
      />
    </div>
  );
}

export default React.memo(DraftEditor);

export function sanitizePastedText(text) {
  // Split text around newlines
  const lines = text.split(/\r?\n/);

  // Process each line to remove bullet points and dashes
  const sanitizedLines = lines.map((line) => {
    // Remove leading/trailing whitespace
    let cleanLine = line;

    // Remove common bullet point patterns
    cleanLine = cleanLine
      // Remove bullet points: •, ◦, ▪, ▫, ‣
      .replace(/^[•◦▪▫‣]\s*/, "")
      // Remove dashes: -, –, —
      .replace(/^[-–—]\s*/, "")
      // Remove asterisks: *
      .replace(/^\*\s*/, "")
      // Remove plus signs: +
      .replace(/^\+\s*/, "")
      // Remove numbered lists: 1., 2), a), (1), etc.
      .replace(/^(\d+|[a-zA-Z])[.)]\s*/, "")
      .replace(/^\(\d+\)\s*/, "")
      .replace(/^\([a-zA-Z]\)\s*/, "")
      // Remove multiple spaces/tabs at the beginning
      .replace(/^\s+/, "");

    return cleanLine;
  });
  return sanitizedLines;
}
