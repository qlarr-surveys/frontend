import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformSignatureData } from '~/utils/analytics/dataTransformers';

export default function SignatureVisualization({ question }) {
  const data = transformSignatureData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total },
    { label: 'Signed', value: data.signed },
    { label: 'Unsigned', value: data.unsigned },
    { label: 'Completion Rate', value: `${data.completionRate}%` },
  ];

  return (
    <ChartContainer>
      <StatsRow stats={stats} columns={4} />
    </ChartContainer>
  );
}
