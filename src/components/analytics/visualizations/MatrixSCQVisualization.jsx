import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformMatrixSCQData } from '~/utils/analytics/dataTransformers';

export default function MatrixSCQVisualization({ question }) {
  const data = transformMatrixSCQData(question);

  const stats = [
    ...buildBaseStats(data),
    { label: 'Rows', value: data.rows.length },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={3} />

        {/* Heatmap */}
        <HeatmapChart
          data={data.heatmapData}
          rows={data.rows}
          columns={data.columns}
          cellSize={60}
          showValues={true}
        />
      </Box>
    </ChartContainer>
  );
}
