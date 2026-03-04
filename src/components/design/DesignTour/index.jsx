import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { designTourSteps } from "./steps";
import "./tour.css";

const QUESTION_TYPES_STEP = 2;

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

function buildStepIntro(stepIndex, step) {
  const counter = `<div class="design-tour-step-counter">STEP ${stepIndex + 1} OF ${designTourSteps.length}</div>`;
  const body = `<div class="design-tour-step-body">${step.intro}</div>`;
  return counter + body;
}

export default function DesignTourProvider({ children }) {
  const introInstanceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const steps = designTourSteps.map((step, i) => ({
        element: step.element,
        title: step.title,
        intro: buildStepIntro(i, step),
        position: step.position,
      }));

      const intro = introJs();
      introInstanceRef.current = intro;

      intro.setOptions({
        steps,
        showBullets: false,
        showStepNumbers: false,
        exitOnOverlayClick: false,
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Done",
        tooltipClass: "design-tour-tooltip",
        highlightClass: "design-tour-highlight",
        scrollToElement: true,
        scrollPadding: 30,
      });

      intro.onBeforeChange(function (_targetElement, currentStep) {
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

        const nextBtn = document.querySelector(".introjs-nextbutton");
        const prevBtn = document.querySelector(".introjs-prevbutton");

        if (nextBtn) {
          nextBtn.textContent = step.nextButtonText || "Next";
        }

        if (stepIndex === 0 && prevBtn) {
          prevBtn.style.display = "inline-block";
          prevBtn.textContent = step.prevButtonText || "Remind me later";
          prevBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            intro.exit();
          };
        } else if (prevBtn) {
          prevBtn.onclick = null;
          prevBtn.textContent = step.prevButtonText || "Back";
        }
      });

      intro.onExit(function () {
        unclampQuestionTypes();
      });

      intro.onComplete(function () {
        unclampQuestionTypes();
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
