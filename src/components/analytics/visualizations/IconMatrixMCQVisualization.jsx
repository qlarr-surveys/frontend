import { Box } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformIconMatrixMCQData } from '~/utils/analytics/dataTransformers';

export default function IconMatrixMCQVisualization({ question }) {
  const data = transformIconMatrixMCQData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Answered', value: data.answered, description: `${data.skipped} skipped`, color: 'green' },
    { label: 'Rows', value: data.rows.length, color: 'purple' },
    { label: 'Avg Selections', value: data.avgSelections, color: 'gray' },
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
