/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { forwardRef } from "react";
import { useSelector } from "react-redux";
import "react-quill/dist/quill.core.css";
import "./content.css";
import { rtlLanguage } from "~/utils/common";

const Content = ({ content, customStyle, name, elementCode, lang }) => {
  const isComplex = content && content.search(/data-instruction/) >= 0;
  const state = useSelector((state) => {
    if (
      !content ||
      !isComplex ||
      !state.runState.values[elementCode] ||
      !name ||
      !lang
    ) {
      return undefined;
    } else {
      return state.runState.values[elementCode][`reference_${name}_${lang}`];
    }
  });

  const surveyLang = useSelector((state) => {
    return state.runState.values["Survey"].lang;
  });

  const isRtl = rtlLanguage.includes(surveyLang);

  if (!content) {
    return <span style={{ flex: 1 }} />;
  } else if (!isComplex) {
    return (
      <div
        css={css`
          ${customStyle}
        `}
        className={`${isRtl ? "rtl" : "ltr"} ql-editor no-padding`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  } else {
    return (
      <div
        css={css`
          ${customStyle}
        `}
        className={`${isRtl ? "rtl" : "ltr"} ql-editor no-padding`}
        dangerouslySetInnerHTML={{
          __html: replaceMentions(content, state),
        }}
      />
    );
  }
};

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
