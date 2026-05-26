import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import {
  getContrastColor,
  getForegroundColor,
  getMildBorderColor,
} from "./utils";

// Centralized fallback chain for the `theme.contrast.*` keys consumed across
// the design editor and run-time survey UI. Falls back to derived colors when
// the survey theme hasn't defined contrast tokens.
export function useThemeContrast() {
  const theme = useTheme();
  return useMemo(() => {
    const paper = theme.palette.background.paper;
    const defaultBg = theme.palette.background.default;
    return {
      onPaper: theme.contrast?.onPaper || getForegroundColor(paper),
      onDefault: theme.contrast?.onDefault || getForegroundColor(defaultBg),
      hoverPaper:
        theme.contrast?.hoverPaper ||
        theme.palette.action?.hover ||
        "transparent",
      mildPaperBorder:
        theme.contrast?.mildPaperBorder ||
        getMildBorderColor(getContrastColor(paper), 0.4),
    };
  }, [theme]);
}
