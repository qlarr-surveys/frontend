import { Quill } from "react-quill";
import Delta from "quill-delta";

const Clipboard = Quill.import("modules/clipboard");

export class SurveyFormClipboard extends Clipboard {
  onPaste(e) {
    e.preventDefault();
    const range = this.quill.getSelection();
    const text = e.clipboardData.getData("text/plain");

    const itemsToPaste = text.split("\r\n").filter(function (item) {
      return item;
    });

    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(text);
    const index = text.length + range.index;
    const length = 0;
    this.quill.updateContents(delta, "silent");
    this.quill.setSelection(index, length, "silent");
  }
}
