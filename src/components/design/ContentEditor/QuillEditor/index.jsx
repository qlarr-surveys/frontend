import React, { useEffect, useMemo, useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill, { Quill } from "react-quill";
import QuillMention from "quill-mention";
import "quill-mention/dist/quill.mention.css";
import { manageStore } from "~/store";
import { SurveyFormClipboard } from "./SurveyFormClipboard";
import { buildReferences } from "~/components/Questions/buildReferences";
Quill.register("modules/mentions", QuillMention);
Quill.register("modules/clipboard", SurveyFormClipboard, true);

function DraftEditor({ value, onBlurListener, extended, isRtl, lang, code }) {
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
        clipboard: {
          // Add the clipboard module with paste and matchVisual options
          matchVisual: false, // Disable matching visual formatting during paste
        },
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
    onFocus();
    setState(oneLine(value, !extended));
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
        theme="snow"
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
