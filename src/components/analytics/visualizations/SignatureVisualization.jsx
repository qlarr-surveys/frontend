import ChartContainer from '../common/ChartContainer';
import StatCard from '../common/StatCard';
import { transformSignatureData } from '~/utils/analytics/dataTransformers';

export default function SignatureVisualization({ question }) {
  const data = transformSignatureData(question);

  return (
    <ChartContainer>
      <StatCard label="Signatures Collected" value={data.signed} color="green" />
    </ChartContainer>
  );
}
