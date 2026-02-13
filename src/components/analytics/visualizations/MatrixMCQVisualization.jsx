import { Box } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformMatrixMCQData } from '~/utils/analytics/dataTransformers';

export default function MatrixMCQVisualization({ question }) {
  const data = transformMatrixMCQData(question);

  const stats = [
    ...buildBaseStats(data),
    { label: 'Rows', value: data.rows.length },
    { label: 'Avg Selections', value: data.avgSelections },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
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
