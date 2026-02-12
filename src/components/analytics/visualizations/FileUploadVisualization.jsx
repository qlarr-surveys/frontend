import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';
import { StatsRow } from '../common/StatCard';
import { transformFileUploadData } from '~/utils/analytics/dataTransformers';

export default function FileUploadVisualization({ question }) {
  const data = transformFileUploadData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Uploaded', value: data.answered, color: 'green' },
    { label: 'Skipped', value: data.skipped, color: 'gray' },
    { label: 'Upload Rate', value: `${data.responseRate}%`, color: 'purple' },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <FrequencyTable data={data.extensionData} valueLabel="Extension" countLabel="Count" />
      </Box>
    </ChartContainer>
  );
}
