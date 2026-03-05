export function getDesignTourSteps(t) {
  return [
    {
      element: '[data-tour="content-panel"]',
      position: "left",
      tooltipClass: "design-tour-tooltip design-tour-step-workspace",
      title: t("tour_step1_title"),
      intro: t("tour_step1_intro"),
      nextButtonText: t("tour_step1_next"),
    },
    {
      element: '[data-tour="page-group"]',
      position: "left",
      tooltipClass: "design-tour-tooltip design-tour-step-workspace",
      title: t("tour_step2_title"),
      intro: t("tour_step2_intro"),
      nextButtonText: t("tour_step2_next"),
    },
    {
      element: '[data-tour="question-types-list"]',
      position: "right",
      title: t("tour_step3_title"),
      intro: t("tour_step3_intro"),
      nextButtonText: t("tour_step3_next"),
    },
    {
      element: '[data-tour="add-page"]',
      position: "right",
      tooltipClass: "design-tour-tooltip design-tour-step-addpage",
      title: t("tour_step4_title"),
      intro: t("tour_step4_intro"),
      nextButtonText: t("tour_step4_next"),
    },
    {
      element: '[data-tour="thank-you-page"]',
      position: "top",
      title: t("tour_step5_title"),
      intro: t("tour_step5_intro"),
      nextButtonText: t("tour_step5_next"),
    },
    {
      element: '[data-tour="preview-button"]',
      position: "bottom-right-aligned",
      tooltipClass: "design-tour-tooltip design-tour-step-preview",
      title: t("tour_step6_title"),
      intro: t("tour_step6_intro"),
      nextButtonText: t("tour_step6_next"),
    },
    {
      element: '[data-tour="side-tabs"]',
      position: "right",
      title: t("tour_step7_title"),
      intro: t("tour_step7_intro"),
      nextButtonText: t("tour_step7_next"),
    },
  ];
}
