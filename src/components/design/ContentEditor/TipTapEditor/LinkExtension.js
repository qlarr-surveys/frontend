import Link from "@tiptap/extension-link";
import { Plugin, PluginKey } from "prosemirror-state";

const LinkExtension = Link.extend({
  addProseMirrorPlugins() {
    return [
      ...this.parent?.() || [],
      new Plugin({
        key: new PluginKey("clearLinkMarkOnDelete"),
        appendTransaction: (transactions, oldState, newState) => {
          const tr = newState.tr;
          let modified = false;

          // Check if there was a deletion (text was removed)
          const hasDeletion = transactions.some(transaction => {
            return transaction.steps.some(step => {
              // Check if this is a replace step that removed content
              if (step.stepType === "replace") {
                const stepSlice = step.slice;
                const stepFrom = step.from;
                const stepTo = step.to;
                // If slice is empty or smaller than what was deleted, it's a deletion
                return stepSlice.size < (stepTo - stepFrom);
              }
              return false;
            });
          });

          if (hasDeletion) {
            // Check if cursor is at a position where link mark might still be active
            const { $from, empty } = newState.selection;
            const linkMark = newState.schema.marks.link;
            
            if (linkMark && empty) {
              // Check if there's a link mark at the cursor position
              const marksAtCursor = $from.marks();
              if (marksAtCursor.some(mark => mark.type === linkMark)) {
                // Clear link mark at cursor position
                tr.removeStoredMark(linkMark);
                modified = true;
              }
            }
          }

          return modified ? tr : null;
        },
      }),
    ];
  },
});

export default LinkExtension;

