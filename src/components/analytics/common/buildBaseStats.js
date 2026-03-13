// Returns the base stats entries common to most visualizations.
export const buildBaseStats = (data) => [
  { label: 'Answered', value: data.answered },
  ...(data.incomplete > 0 ? [{ label: 'Incomplete', value: data.incomplete }] : []),
  ...(data.preview > 0 ? [{ label: 'Preview', value: data.preview }] : []),
];
