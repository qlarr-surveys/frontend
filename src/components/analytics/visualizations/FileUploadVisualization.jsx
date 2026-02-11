import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';
import { transformFileUploadData } from '~/utils/analytics/dataTransformers';

export default function FileUploadVisualization({ question }) {
  const data = transformFileUploadData(question);

  return (
    <ChartContainer>
      <FrequencyTable data={data} valueLabel="Extension" countLabel="Count" />
    </ChartContainer>
  );
}
