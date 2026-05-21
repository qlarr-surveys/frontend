import React, { useEffect, useState } from "react";
import styles from "./DynamicSvg.module.css";
import { placeholderIconSvg } from "~/components/Questions/placeholderImage";

function DynamicSvg({
  svgUrl,
  imageHeight,
  maxHeight = "inherit",
  onIconClick,
  opacity = 1,
  isSelected = false,
  theme,
}) {
  const [fetchedSvg, setFetchedSvg] = useState("");

  useEffect(() => {
    if (!svgUrl) return;
    const fetchSvg = async () => {
      const response = await fetch(svgUrl);
      const svgText = await response.text();
      setFetchedSvg(svgText);
    };
    fetchSvg();
  }, [svgUrl]);

  // No uploaded icon yet: fall back to the theme-aware placeholder, generated
  // inline so it recolours with the survey theme.
  const svgContent = svgUrl ? fetchedSvg : placeholderIconSvg(theme);

  return (
    <div
      style={{
        opacity: opacity,
        maxHeight: maxHeight,
        maxWidth: maxHeight,
        height: imageHeight,
        aspectRatio: "1",
        padding: "2px",
        width: imageHeight,
        margin: "auto",
        borderRadius: "8px",
        color: isSelected
          ? theme.palette.primary.main
          : (theme.textStyles?.text?.color),
        border: isSelected
          ? `4px solid ${theme.palette.primary.main}`
          : "4px solid transparent",
      }}
      onClick={onIconClick}
      className={styles.svgContainer}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

export default DynamicSvg;
