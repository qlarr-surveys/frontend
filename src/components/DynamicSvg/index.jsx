import React, { useEffect, useState } from "react";
import styles from "./DynamicSvg.module.css";

function DynamicSvg({ svgUrl, imageHeightPx, iconColor, onIconClick, opacity=1 }) {
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

  return (
    <div
      style={{
        opacity : opacity,
        color: iconColor,
        height: imageHeightPx + "px",
        width: imageHeightPx + "px",
        borderRadius: "8px",
      }}
      onClick={onIconClick}
      className={styles.svgContainer}
      dangerouslySetInnerHTML={{ __html: svgContent ? svgContent : "" }}
    />
  );
}

export default DynamicSvg;
