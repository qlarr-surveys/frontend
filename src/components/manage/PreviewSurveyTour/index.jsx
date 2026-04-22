import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { getPreviewTourSteps } from "./steps";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { isSessionRtl } from "~/utils/common";
import "./tour.css";

const RTL_POSITION_MAP = {
  left: "right",
  right: "left",
  "bottom-right-aligned": "bottom-left-aligned",
  "bottom-left-aligned": "bottom-right-aligned",
};

const TOUR_STORAGE_KEY = "preview_survey_tour_completed";
const TOUR_START_DELAY_MS = 500;

export default function PreviewSurveyTourProvider({ children }) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const introInstanceRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(TOUR_STORAGE_KEY) === "true") return;

    const rtl = isSessionRtl();
    const tourSteps = getPreviewTourSteps(t);

    const timer = setTimeout(() => {
      const steps = tourSteps.map((step) => ({
        element: step.element,
        title: step.title,
        intro: buildStepIntro(step),
        position: rtl ? (RTL_POSITION_MAP[step.position] || step.position) : step.position,
        tooltipClass: step.tooltipClass,
      }));

      const intro = introJs();
      introInstanceRef.current = intro;

      intro.setOptions({
        steps,
        showBullets: false,
        showStepNumbers: false,
        exitOnOverlayClick: false,
        showSkipButton: false,
        disableInteraction: true,
        autoPosition: false,
        hidePrev: false,
        nextLabel: t("preview_page_tour.step1_next"),
        prevLabel: t("preview_page_tour.tour_back"),
        doneLabel: t("preview_page_tour.step2_next"),
        tooltipClass: "preview-tour-tooltip",
        highlightClass: "preview-tour-highlight",
        scrollToElement: false,
        scrollPadding: 0,
        helperElementPadding: 0,
      });

      intro.onAfterChange(function () {
        const stepIndex = this.getCurrentStep();
        const step = tourSteps[stepIndex];
        if (!step) return;

        setTimeout(() => {
          const nextBtn = document.querySelector(".introjs-nextbutton");
          const prevBtn = document.querySelector(".introjs-prevbutton");
          const backText = t("preview_page_tour.tour_back");

          if (nextBtn) {
            const nextText = step.nextButtonText;
            nextBtn.textContent = rtl ? `${nextText} ←` : `${nextText} →`;
          }

          if (!prevBtn) return;

          prevBtn.classList.remove("introjs-disabled", "introjs-hidden");
          prevBtn.removeAttribute("style");
          prevBtn.style.display = "inline-flex";
          prevBtn.textContent = rtl ? `→ ${backText}` : `← ${backText}`;

          if (stepIndex === 0) {
            prevBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              intro.exit();
            };
          } else {
            prevBtn.onclick = null;
          }
        }, 0);
      });

      intro.onComplete(function () {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      });

      intro.onExit(function () {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        document
          .querySelector(".introjs-showElement")
          ?.classList.remove("introjs-showElement", "introjs-relativePosition");
      });

      intro.start();
    }, TOUR_START_DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (introInstanceRef.current) {
        introInstanceRef.current.exit(true);
      }
    };
  }, []);

  return <>{children}</>;
}

function buildStepIntro(step) {
  return `<div class="preview-tour-step-body">${step.intro}</div>`;
}
