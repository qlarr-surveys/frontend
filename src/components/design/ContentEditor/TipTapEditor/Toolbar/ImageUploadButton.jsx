import React from "react";
import { useTranslation } from "react-i18next";
import PhotoIcon from "@mui/icons-material/Photo";
import LoadingDots from "~/components/common/LoadingDots";

const ImageUploadButton = ({ onImageUpload, isUploading }) => {
  const { t } = useTranslation("design");

  return (
    <div
      style={{ display: "inline-block" }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <label
        style={{
          display: "inline-block",
          cursor: isUploading ? "not-allowed" : "pointer",
          margin: 0,
          padding: 0,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          style={{ display: "none" }}
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        <span
          className="tiptap-toolbar-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: isUploading ? "none" : "auto",
            opacity: isUploading ? 0.6 : 1,
          }}
          title={t("tiptap_insert_image")}
        >
          {isUploading ? (
            <LoadingDots />
          ) : (
            <PhotoIcon style={{ fontSize: "16px" }} />
          )}
        </span>
      </label>
    </div>
  );
};

export default React.memo(ImageUploadButton);

