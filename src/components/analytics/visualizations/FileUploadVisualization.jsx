import { Box } from '@mui/material';
import CompletionCard from '../charts/CompletionCard';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformFileUploadData } from '~/utils/analytics/dataTransformers';

export default function FileUploadVisualization({ question }) {
  const data = transformFileUploadData(question);

  const stats = [
    { label: 'Total Expected', value: data.total, color: 'blue' },
    { label: 'Uploaded', value: data.uploaded, color: 'green' },
    { label: 'Not Uploaded', value: data.notUploaded, color: 'red' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, color: 'purple' },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CompletionCard
            rate={data.completionRate}
            completed={data.uploaded}
            total={data.total}
            label="Files Uploaded"
            color="auto"
            size="large"
          />
        </Box>
      </Box>
    </ChartContainer>
  );
}
