import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { designTourSteps } from "./steps";
import "./tour.css";

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

function buildStepTitle(stepIndex, step) {
  const counter = `<div class="design-tour-step-counter">Step ${stepIndex + 1} of ${designTourSteps.length}</div>`;
  return counter + step.title;
}

function buildStepIntro(step) {
  return `<div class="design-tour-step-body">${step.intro}</div>`;
}

export default function DesignTourProvider({ children }) {
  const introInstanceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const steps = designTourSteps.map((step, i) => ({
        element: step.element,
        title: buildStepTitle(i, step),
        intro: buildStepIntro(step),
        position: step.position,
        tooltipClass: step.tooltipClass,
      }));

      const intro = introJs();
      introInstanceRef.current = intro;

      intro.setOptions({
        steps,
        showBullets: false,
        showStepNumbers: false,
        exitOnOverlayClick: false,
        autoPosition: false,
        hidePrev: false,
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Let's go \u2713",
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
        const step = designTourSteps[stepIndex];
        if (!step) return;

        // Delay to ensure intro.js has finished its DOM updates
        setTimeout(() => {
          const nextBtn = document.querySelector(".introjs-nextbutton");
          const prevBtn = document.querySelector(".introjs-prevbutton");

          if (nextBtn) {
            const nextText = step.nextButtonText || "Next";
            nextBtn.textContent = `${nextText} \u2192`;
          }

          if (stepIndex === 0 && prevBtn) {
            prevBtn.classList.remove("introjs-disabled", "introjs-hidden");
            prevBtn.removeAttribute("style");
            prevBtn.style.display = "inline-flex";
            prevBtn.innerHTML = `${REMIND_ICON} Remind me later`;
            prevBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              intro.exit();
            };
          } else if (prevBtn) {
            prevBtn.removeAttribute("style");
            prevBtn.onclick = null;
            prevBtn.textContent = `\u2190 ${step.prevButtonText || "Back"}`;
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
  }, []);

  return <>{children}</>;
}
