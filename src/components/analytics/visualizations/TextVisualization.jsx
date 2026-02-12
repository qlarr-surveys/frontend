import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import FrequencyTable from '../common/FrequencyTable';
import { transformTextData } from '~/utils/analytics/dataTransformers';

export default function TextVisualization({ question }) {
  const data = transformTextData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Answered', value: data.answered, description: `${data.skipped} skipped`, color: 'green' },
    { label: 'Unique Responses', value: data.uniqueCount, color: 'purple' },
    { label: 'Avg Length', value: `${data.avgLength} chars`, color: 'gray' },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <FrequencyTable
          data={data.frequencyData.slice(0, 15)}
          valueLabel="Response"
          countLabel="Count"
        />
      </Box>
    </ChartContainer>
  );
}
