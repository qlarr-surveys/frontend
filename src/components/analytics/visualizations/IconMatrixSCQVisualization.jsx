import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformIconMatrixSCQData } from '~/utils/analytics/dataTransformers';

export default function IconMatrixSCQVisualization({ question }) {
  const data = transformIconMatrixSCQData(question);

  const highestRated = data.rowAverages.reduce(
    (max, row) => (parseFloat(row.average) > parseFloat(max.average) ? row : max),
    { average: 0 }
  );

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Rows', value: data.rows.length, color: 'purple' },
    { label: 'Columns', value: data.columns.length, color: 'gray' },
    {
      label: 'Highest Rated',
      value: highestRated.row || '-',
      description: `Avg: ${highestRated.average}`,
      color: 'green',
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />

        <HeatmapChart
          data={data.heatmapData}
          rows={data.rows}
          columns={data.columnsWithIcons}
          cellSize={60}
          showValues={true}
        />

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Row Averages
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
            {data.rowAverages.map((row, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {row.row}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {row.average}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </ChartContainer>
  );
}
