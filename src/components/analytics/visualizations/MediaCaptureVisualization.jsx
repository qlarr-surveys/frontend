import { Box } from '@mui/material';
import CompletionCard from '../charts/CompletionCard';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformMediaCaptureData } from '~/utils/analytics/dataTransformers';

export default function MediaCaptureVisualization({ question }) {
  const data = transformMediaCaptureData(question);

  const stats = [
    { label: 'Total Expected', value: data.total, color: 'blue' },
    { label: 'Captured', value: data.captured, color: 'green' },
    { label: 'Not Captured', value: data.notCaptured, color: 'red' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, color: 'purple' },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CompletionCard
            rate={data.completionRate}
            completed={data.captured}
            total={data.total}
            label="Photos Captured"
            color="auto"
            size="large"
          />
        </Box>
      </Box>
    </ChartContainer>
  );
}
