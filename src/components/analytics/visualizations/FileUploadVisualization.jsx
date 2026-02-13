import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';
import { StatsRow } from '../common/StatCard';
import { transformFileUploadData } from '~/utils/analytics/dataTransformers';

export default function FileUploadVisualization({ question }) {
  const data = transformFileUploadData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total },
    { label: 'Uploaded', value: data.answered },
    { label: 'Skipped', value: data.skipped },
    { label: 'Upload Rate', value: `${data.responseRate}%` },
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
