import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';

export default function DateTimeVisualization({ question }) {
  const counts = {};
  question.responses.forEach((r) => { counts[r] = (counts[r] || 0) + 1; });
  const total = question.responses.length;
  const data = Object.entries(counts)
    .map(([value, count]) => ({ value, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartContainer>
      <FrequencyTable data={data} valueLabel="Date & Time" />
    </ChartContainer>
  );
}
