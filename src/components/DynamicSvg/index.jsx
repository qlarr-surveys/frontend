import React, { useEffect, useState } from "react";
import styles from "./DynamicSvg.module.css";

function DynamicSvg({
  svgUrl,
  imageHeight,
  maxHeight = "inherit",
  iconColor,
  onIconClick,
  opacity = 1,
}) {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    const fetchSvg = async () => {
      const response = await fetch(svgUrl);
      const svgText = await response.text();
      setSvgContent(svgText);
    };
    if (svgUrl) {
      fetchSvg();
    }
  }, [svgUrl]);

  return svgUrl && svgContent ? (
    <div
      style={{
        opacity: opacity,
        color: iconColor,
        maxHeight: maxHeight,
        maxWidth: maxHeight,
        height: imageHeight,
        width: imageHeight,
        borderRadius: "8px",
      }}
      onClick={onIconClick}
      className={styles.svgContainer}
      dangerouslySetInnerHTML={{ __html: svgContent ? svgContent : "" }}
    />
  ) : (
    <div
      style={{
        opacity: opacity,
        color: iconColor,
        maxHeight: maxHeight,
        maxWidth: maxHeight,
        height: imageHeight,
        width: imageHeight,
        borderRadius: "8px",
        backgroundImage: `url('/placeholder-image.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onClick={onIconClick}
      className={styles.svgContainer}
    />
  );
}

export default DynamicSvg;
