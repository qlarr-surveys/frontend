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
import InstructionHighlightExtension from "./InstructionHighlightExtension";

export function createBaseExtensions() {
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
  ];
}

export function createAllExtensions({
  getMentionSuggestions,
  referenceInstruction,
}) {
  const baseExtensions = createBaseExtensions();
  const mentionExtension = createMentionExtension({
    getMentionSuggestions,
    referenceInstruction,
  });
  const instructionHighlightExtension = InstructionHighlightExtension.configure({
    referenceInstruction,
  });

  return [...baseExtensions, mentionExtension, instructionHighlightExtension];
}
