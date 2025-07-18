import { Quill } from "react-quill";
import Delta from "quill-delta";

const Clipboard = Quill.import("modules/clipboard");

export class SurveyFormClipboard extends Clipboard {
  constructor(quill, options = {}) {
    super(quill, options);
    this.onPasteCallback = options.onPasteCallback;
  }
  onPaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    this.onPasteCallback(text);
  }
}
