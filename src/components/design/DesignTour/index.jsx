import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { getDesignTourSteps } from "./steps";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { isSessionRtl } from "~/utils/common";
import "./tour.css";

const RTL_POSITION_MAP = {
  left: "right",
  right: "left",
  "bottom-right-aligned": "bottom-left-aligned",
  "bottom-left-aligned": "bottom-right-aligned",
};

const QUESTION_TYPES_STEP = 2;
const REMIND_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">' +
  '<path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 ' +
  '0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>';

function clampQuestionTypes() {
  const el = document.querySelector('[data-tour="question-types-list"]');
  const sidebar = el?.parentElement;
  if (!sidebar || !el) return;

  sidebar.scrollTop = 0;
  sidebar.style.overflow = "hidden";

  const sidebarRect = sidebar.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const visibleHeight = sidebarRect.bottom - elRect.top;
  if (visibleHeight > 0) {
    el.style.maxHeight = `${visibleHeight}px`;
    el.style.overflow = "hidden";
  }
}

function unclampQuestionTypes() {
  const el = document.querySelector('[data-tour="question-types-list"]');
  const sidebar = el?.parentElement;
  if (sidebar) {
    sidebar.style.overflow = "";
  }
  if (el) {
    el.style.maxHeight = "";
    el.style.overflow = "";
  }
}

export default function DesignTourProvider({ children }) {
  const { t } = useTranslation(NAMESPACES.DESIGN_CORE);
  const introInstanceRef = useRef(null);

  useEffect(() => {
    const rtl = isSessionRtl();
    const tourSteps = getDesignTourSteps(t);

    const timer = setTimeout(() => {
      const steps = tourSteps.map((step, i) => ({
        element: step.element,
        title: buildStepTitle(i, tourSteps, t),
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
        nextLabel: t("tour_next"),
        prevLabel: t("tour_back"),
        doneLabel: t("tour_done"),
        tooltipClass: "design-tour-tooltip",
        highlightClass: "design-tour-highlight",
        scrollToElement: false,
        scrollPadding: 0,
        helperElementPadding: 0,
      });

      intro.onBeforeChange(function (_targetElement, currentStep) {
        // Reset scroll on sidebar and content panel before each step
        const leftContent = document.querySelector('[class*="leftContent"]');
        if (leftContent) leftContent.scrollTop = 0;
        // Virtuoso scroller has data-test-id="virtuoso-scroller"
        const virtuosoScroller = document.querySelector('[data-tour="content-panel"] [data-test-id="virtuoso-scroller"]');
        if (virtuosoScroller) {
          virtuosoScroller.scrollTop = 0;
        }

        if (currentStep === QUESTION_TYPES_STEP) {
          clampQuestionTypes();
        } else {
          unclampQuestionTypes();
        }
        return true;
      });

      intro.onAfterChange(function () {
        const stepIndex = this.getCurrentStep();
        const step = tourSteps[stepIndex];
        if (!step) return;

        // Delay to ensure intro.js has finished its DOM updates
        setTimeout(() => {
          const nextBtn = document.querySelector(".introjs-nextbutton");
          const prevBtn = document.querySelector(".introjs-prevbutton");

          if (nextBtn) {
            const nextText = step.nextButtonText || t("tour_next");
            nextBtn.textContent = rtl ? `${nextText} \u2190` : `${nextText} \u2192`;
          }

          if (stepIndex === 0 && prevBtn) {
            prevBtn.classList.remove("introjs-disabled", "introjs-hidden");
            prevBtn.removeAttribute("style");
            prevBtn.style.display = "inline-flex";
            prevBtn.innerHTML = `${REMIND_ICON} ${t("tour_remind_me_later")}`;
            prevBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              intro.exit();
            };
          } else if (prevBtn) {
            prevBtn.removeAttribute("style");
            prevBtn.onclick = null;
            const backText = step.prevButtonText || t("tour_back");
            prevBtn.textContent = rtl ? `\u2192 ${backText}` : `\u2190 ${backText}`;
          }
        }, 0);
      });

      intro.onExit(function () {
        unclampQuestionTypes();
        document.querySelector(".introjs-showElement")?.classList.remove("introjs-showElement", "introjs-relativePosition");
        window.scrollTo(0, 0);
      });

      intro.start();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (introInstanceRef.current) {
        introInstanceRef.current.exit(true);
      }
      unclampQuestionTypes();
    };
  }, [t]);

  return <>{children}</>;
}

function buildStepTitle(stepIndex, tourSteps, t) {
  const counter = `<div class="design-tour-step-counter">${t("tour_step_counter", { current: stepIndex + 1, total: tourSteps.length })}</div>`;
  return counter + tourSteps[stepIndex].title;
}

function buildStepIntro(step) {
  return `<div class="design-tour-step-body">${step.intro}</div>`;
}
