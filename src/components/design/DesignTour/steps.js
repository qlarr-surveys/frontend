export const designTourSteps = [
  {
    element: '[data-tour="content-panel"]',
    position: "left",
    tooltipClass: "design-tour-tooltip design-tour-step-workspace",
    title: "Your Survey Workspace",
    intro:
      "This is your survey's home.\nAdd pages, build questions, and shape the experience for your respondents.",
    nextButtonText: "Next: Drag Questions",
  },
  {
    element: '[data-tour="page-group"]',
    position: "left",
    tooltipClass: "design-tour-tooltip design-tour-step-workspace",
    title: "Drag Questions Here",
    intro: "Drag question types from the left panel and drop them here to build your page.",
    nextButtonText: "Next: Choose a Question Type",
  },
  {
    element: '[data-tour="question-types-list"]',
    position: "right",
    title: "Choose a Question Type",
    intro: "Select a question type, then drag it into your page to add it to your survey.",
    nextButtonText: "Next: Add a New Page",
  },
  {
    element: '[data-tour="add-page"]',
    position: "right",
    tooltipClass: "design-tour-tooltip design-tour-step-addpage",
    title: "Add a New Page",
    intro: "Add a new page to organize your questions, help you group content and improve the user flow.",
    nextButtonText: "Next: Customize Thank You Page",
  },
  {
    element: '[data-tour="thank-you-page"]',
    position: "top",
    title: "Customize Your Thank You Page",
    intro:
      "This is the final page respondents see after submitting your survey.\nPersonalize it with a Text, Image, or Video.",
    nextButtonText: "Next: Review Your Survey",
  },
  {
    element: '[data-tour="preview-button"]',
    position: "bottom-right-aligned",
    tooltipClass: "design-tour-tooltip design-tour-step-preview",
    title: "Review Your Survey",
    intro: "Take a final look at your survey before sharing it.\nPreview it exactly as your respondents will see it.",
    nextButtonText: "Next: Side Menu",
  },
  {
    element: '[data-tour="side-tabs"]',
    position: "right",
    title: "Manage Your Survey from Here",
    intro:
      "Use the side menu to control every part anytime while building your survey." +
      "\n<b>Design</b> \u2013 Build and edit your survey questions." +
      "\n<b>Theme & Style</b> \u2013 Change colors, background, and overall look." +
      "\n<b>Languages</b> \u2013 Create and manage multiple language versions." +
      "\n<b>Settings</b> \u2013 Adjust survey behavior, privacy, and response rules." +
      "\n<b>Responses</b> \u2013 View, manage, and export collected answers.",
    nextButtonText: "Let's go",
  },
];
