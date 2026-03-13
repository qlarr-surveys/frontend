import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformIconMatrixSCQData } from '~/utils/analytics/dataTransformers';

export default function IconMatrixSCQVisualization({ question }) {
  const data = useMemo(() => transformIconMatrixSCQData(question), [question]);

  const stats = [
    ...buildBaseStats(data),
    { label: 'Rows', value: data.rows.length },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={3} />

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
