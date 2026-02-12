import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformSignatureData } from '~/utils/analytics/dataTransformers';

export default function SignatureVisualization({ question }) {
  const data = transformSignatureData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Signed', value: data.signed, color: 'green' },
    { label: 'Unsigned', value: data.unsigned, color: 'red' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, color: 'purple' },
  ];

  return (
    <ChartContainer>
      <StatsRow stats={stats} columns={4} />
    </ChartContainer>
  );
}
