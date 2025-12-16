import React from "react";
import { useTranslation } from "react-i18next";
import FormatButton from "./FormatButton";

const ListControls = ({ editor }) => {
  const { t } = useTranslation("design");

  return (
    <>
      <FormatButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title={t("tiptap_ordered_list")}
      >
        1.
      </FormatButton>

      <FormatButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title={t("tiptap_bullet_list")}
      >
        •
      </FormatButton>

      <FormatButton
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        isActive={false}
        title={t("tiptap_decrease_indent")}
        disabled={!editor.can().liftListItem("listItem")}
      >
        ◂
      </FormatButton>

      <FormatButton
        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        isActive={false}
        title={t("tiptap_increase_indent")}
        disabled={!editor.can().sinkListItem("listItem")}
      >
        ▸
      </FormatButton>
    </>
  );
};

export default React.memo(ListControls);

