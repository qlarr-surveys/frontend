import { useMemo } from 'react';
import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';
import { StatsRow } from '../common/StatCard';
import { transformFileUploadData } from '~/utils/analytics/dataTransformers';

export default function FileUploadVisualization({ question }) {
  const data = useMemo(() => transformFileUploadData(question), [question]);

  const stats = [
    { label: 'Uploaded', value: data.answered },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={1} />
        <FrequencyTable data={data.extensionData} valueLabel="Extension" countLabel="Count" />
      </Box>
    </ChartContainer>
  );
}
