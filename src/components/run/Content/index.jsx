import React from "react";
import { useSelector } from "react-redux";
import "react-quill/dist/quill.core.css";
import "./content.css";
import { rtlLanguage } from "~/utils/common";

function Content(props) {
  const isComplex =
    props.content && props.content.search(/data-instruction/) >= 0;
  const state = useSelector((state) => {
    if (
      !props.content ||
      !isComplex ||
      !state.runState.values[props.elementCode] ||
      !props.name ||
      !props.lang
    ) {
      return undefined;
    } else {
      return state.runState.values[props.elementCode][
        `reference_${props.name}_${props.lang}`
      ];
    }
  });

  const lang = useSelector((state) => {
    return state.runState.values["Survey"].lang;
  });

  const isRtl = rtlLanguage.includes(lang);

  if (!props.content) {
    return <span style={{ flex: 1 }} />;
  } else if (!isComplex) {
    return (
      <div
        style={{
          ...props.style,
          fontFamily: props.fontFamily,
          color: props.color,
          fontSize: props.fontSize + "px",
        }}
        className={`${isRtl ? "rtl" : "ltr"} ql-editor no-padding`}
        dangerouslySetInnerHTML={{ __html: props.content }}
      />
    );
  } else {
    return (
      <div
        style={{
          ...props.style,
          fontFamily: props.fontFamily,
          color: props.color,
          fontSize: props.fontSize + "px",
        }}
        className={`${isRtl ? "rtl" : "ltr"} ql-editor no-padding`}
        dangerouslySetInnerHTML={{
          __html: replaceMentions(props.content, state),
        }}
      />
    );
  }
}

export default React.memo(Content);

function replaceMentions(html, referenceValue) {
  let doc = document.createElement("div");
  doc.innerHTML = html;
  doc.querySelectorAll("span[data-instruction]").forEach(function (el) {
    let attribute = el.getAttribute("data-instruction");
    if (attribute && referenceValue) {
      let attrArray = attribute.split(".");
      if (
        attrArray &&
        attrArray.length == 2 &&
        referenceValue[attrArray[0]] &&
        referenceValue[attrArray[0]][attrArray[1]]
      ) {
        el.replaceWith(referenceValue[attrArray[0]][attrArray[1]]);
      } else {
        el.replaceWith("");
      }
    } else {
      el.replaceWith("");
    }
  });
  return doc.innerHTML;
}
