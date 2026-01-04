import { Extension } from "@tiptap/core";

export const PreventEnterExtension = Extension.create({
  name: "preventEnter",

  addOptions() {
    return {
      extended: true,
      onNewLine: null,
      onBlurListener: null,
      lang: null,
    };
  },

  addKeyboardShortcuts() {
    const shortcuts = {};

    // Only register Enter handler when extended is false (for options)
    if (!this.options.extended) {
      shortcuts.Enter = async () => {
        const html = this.editor.getHTML();
        const isEmpty =
          !html || html.trim() === "" || html.trim() === "<p></p>";

        // Save content before moving to next option
        if (
          !isEmpty &&
          typeof this.options.onBlurListener === "function" &&
          this.options.lang
        ) {
          try {
            const result = this.options.onBlurListener(html, this.options.lang);
            if (result instanceof Promise) {
              await result;
            }
          } catch (error) {
            console.error(
              "[PreventEnterExtension] Error saving content:",
              error
            );
          }
        }

        // Move to next option (even if empty)
        if (typeof this.options.onNewLine === "function") {
          try {
            this.options.onNewLine();
          } catch (error) {
            console.error(
              "[PreventEnterExtension] Error in onNewLine callback:",
              error
            );
          }
        }
        return true;
      };

      shortcuts["Shift-Enter"] = () => {
        return true; // Prevent Shift-Enter in non-extended mode
      };
    }

    return shortcuts;
  },
});
