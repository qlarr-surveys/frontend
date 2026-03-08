import { useSelector } from "react-redux";
import { useResponsive } from "~/hooks/use-responsive";

// Re-export pure functions from @qlarr/design-engine
export {
  isEquivalent,
  diff,
  nextId,
  stripTags,
  truncateWithEllipsis,
  isQuestion,
  isGroup,
  lastIndexInArray,
  firstIndexInArray,
} from "@qlarr/design-engine";

export const isNotEmptyHtml = (value) => {
  if (!value) return false;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = value;

  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  const hasImages = tempDiv.querySelectorAll("img").length > 0;

  return textContent.trim().length > 0 || hasImages;
};

export const useColumnMinWidth = (code, runComponent) => {
  const isDesktop = useResponsive("up", "lg");
  const isTablet = useResponsive("between", "md", "lg");

  const designStateWidths = useSelector((state) => state?.designState?.[code]);
  const widthSetups = {
    minHeaderDesktop: 90,
    minHeaderMobile: 60,
    minRowLabelDesktop: 90,
    minRowLabelMobile: 60,
    ...(runComponent || {}),
    ...(designStateWidths || {}),
  };
  const {
    minHeaderDesktop,
    minHeaderMobile,
    minRowLabelDesktop,
    minRowLabelMobile,
  } = widthSetups;

  if (isDesktop || isTablet) {
    return {
      header: `${minHeaderDesktop}`,
      rowLabel: `${minRowLabelDesktop}`,
    };
  }

  return {
    header: `${minHeaderMobile}`,
    rowLabel: `${minRowLabelMobile}`,
  };
};
