import { Box } from '@mui/material';
import CompletionCard from '../charts/CompletionCard';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformMediaCaptureData } from '~/utils/analytics/dataTransformers';

export default function MediaCaptureVisualization({ question }) {
  const data = transformMediaCaptureData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total },
    { label: 'Captured', value: data.captured },
    { label: 'Not Captured', value: data.notCaptured },
    { label: 'Completion Rate', value: `${data.completionRate}%` },
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
