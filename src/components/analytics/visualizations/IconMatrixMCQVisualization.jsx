import { Box } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformIconMatrixMCQData } from '~/utils/analytics/dataTransformers';

export default function IconMatrixMCQVisualization({ question }) {
  const data = transformIconMatrixMCQData(question);

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
          columns={data.columnsWithIcons}
          rowsWithIcons={data.rowsWithIcons}
          cellSize={60}
          showValues={true}
        />
      </Box>
    </ChartContainer>
  );
}
