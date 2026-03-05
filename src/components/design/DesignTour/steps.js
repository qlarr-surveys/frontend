export const designTourSteps = [
  {
    element: '[data-tour="content-panel"]',
    position: "left",
    tooltipClass: "design-tour-tooltip design-tour-step-workspace",
    title: "Your Survey Workspace",
    intro:
      "This is your survey's home.\nAdd pages, build questions, and shape the experience for your respondents.",
    nextButtonText: "Next: Add Your First Page",
  },
  {
    element: '[data-tour="page-group"]',
    position: "left",
    tooltipClass: "design-tour-tooltip design-tour-step-workspace",
    title: "Your First Page",
    intro: "This is your first survey page.\nClick on it to add and edit questions.",
    nextButtonText: "Next: Explore Question Types",
  },
  {
    element: '[data-tour="question-types-list"]',
    position: "right",
    title: "Choose Your Question Types",
    intro: "Browse all available question types here — text, choice, rating, and more.",
    nextButtonText: "Next: Add More Pages",
  },
  {
    element: '[data-tour="add-page"]',
    position: "right",
    tooltipClass: "design-tour-tooltip design-tour-step-addpage",
    title: "Add More Pages",
    intro: "Add new pages to organize your survey into sections.",
    nextButtonText: "Next: Customize Thank You Page",
  },
  {
    element: '[data-tour="thank-you-page"]',
    position: "top",
    title: "Customize Your Thank You Page",
    intro:
      "This is the final page respondents see after submitting your survey.\nPersonalize it with a Text, Image, or Video.",
    nextButtonText: "Next: Preview Your Survey",
  },
  {
    element: '[data-tour="preview-button"]',
    position: "bottom-right-aligned",
    tooltipClass: "design-tour-tooltip design-tour-step-preview",
    title: "Preview Your Survey",
    intro: "Preview your survey anytime to see how it looks to respondents.",
    nextButtonText: "Next: Explore Side Tabs",
  },
  {
    element: '[data-tour="side-tabs"]',
    position: "right",
    title: "Explore the Side Tabs",
    intro: "Switch between Design, Theme, Translation, Settings, and Responses.",
    nextButtonText: "Finish Tour",
  },
];
