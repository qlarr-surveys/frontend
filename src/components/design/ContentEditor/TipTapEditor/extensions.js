import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "./LinkExtension";
import ImageExtension from "./ImageExtension";
import CollapsibleExtension from "./CollapsibleExtension";
import FontSize from "./FontSizeExtension";
import { createMentionExtension } from "./MentionExtension";
import { PreventEnterExtension } from "./PreventEnterExtension";

export function createBaseExtensions(
  extended = true,
  onNewLine = null,
  onBlurListener = null,
  lang = null
) {
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
    ImageExtension.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: "tiptap-image",
      },
    }),
    CollapsibleExtension,
    PreventEnterExtension.configure({
      extended,
      onNewLine,
      onBlurListener,
      lang,
    }),
  ];
}

export function createAllExtensions({
  getMentionSuggestions,
  referenceInstruction,
  extended = true,
  onNewLine = null,
  onBlurListener = null,
  lang = null,
}) {
  const baseExtensions = createBaseExtensions(
    extended,
    onNewLine,
    onBlurListener,
    lang
  );
  const mentionExtension = createMentionExtension({
    getMentionSuggestions,
    referenceInstruction,
  });

  return [...baseExtensions, mentionExtension];
}
