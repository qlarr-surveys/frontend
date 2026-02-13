import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformMatrixSCQData } from '~/utils/analytics/dataTransformers';

export default function MatrixSCQVisualization({ question }) {
  const data = transformMatrixSCQData(question);

  // Calculate highest rated row
  const highestRated = data.rowAverages.reduce(
    (max, row) => (parseFloat(row.average) > parseFloat(max.average) ? row : max),
    { average: 0 }
  );

  const stats = [
    ...buildBaseStats(data),
    { label: 'Rows', value: data.rows.length },
    {
      label: 'Highest Rated',
      value: highestRated.row || '-',
      description: `Avg: ${highestRated.average}`,
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Heatmap */}
        <HeatmapChart
          data={data.heatmapData}
          rows={data.rows}
          columns={data.columns}
          cellSize={60}
          showValues={true}
        />

        {/* Row Averages */}
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
