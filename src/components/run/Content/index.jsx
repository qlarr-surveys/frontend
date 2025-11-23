import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
// Note: ql-editor class is used for styling rendered content, not the editor itself
// The editor has been migrated to Tiptap
import "./content.css";
import { rtlLanguage } from "~/utils/common";

function Content(props) {
  const contentRef = useRef(null);
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

  // Handle collapsible button clicks in rendered view
  useEffect(() => {
    if (contentRef.current) {
      const handleCollapsibleClick = (e) => {
        const button = e.target.closest(".collapsible-button");
        if (button) {
          e.preventDefault();
          e.stopPropagation();
          const collapsible = button.closest(".tiptap-collapsible");
          if (collapsible) {
            const content = collapsible.querySelector(".collapsible-content");
            const isOpen = collapsible.getAttribute("data-open") === "true";
            const newState = !isOpen;
            collapsible.setAttribute("data-open", newState ? "true" : "false");
            if (newState) {
              content.style.display = "";
              content.classList.add("open");
            } else {
              content.style.display = "none";
              content.classList.remove("open");
            }
          }
        }
      };

      contentRef.current.addEventListener("click", handleCollapsibleClick);
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener(
            "click",
            handleCollapsibleClick
          );
        }
      };
    }
  }, [props.content]);

  if (!props.content) {
    return <span style={{ flex: 1 }} />;
  } else if (!isComplex) {
    return (
      <div
        ref={contentRef}
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
        ref={contentRef}
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
