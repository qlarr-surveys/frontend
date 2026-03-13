import { useMemo } from 'react';
import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';

export default function TimeVisualization({ question }) {
  const data = useMemo(() => {
    const counts = {};
    question.responses.forEach((r) => {
      const timeOnly = r.includes(' ') ? r.split(' ')[1] : r;
      counts[timeOnly] = (counts[timeOnly] || 0) + 1;
    });
    const total = question.totalResponses ?? question.responses.length;
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [question]);

  return (
    <ChartContainer>
      <FrequencyTable data={data} valueLabel="Time" />
    </ChartContainer>
  );
}
