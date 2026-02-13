// Returns the two stats entries common to most visualizations: Total Submissions + Answered.
export const buildBaseStats = (data) => [
  { label: 'Total Submissions', value: data.total },
  { label: 'Answered', value: data.answered, description: `${data.skipped} skipped` },
];
