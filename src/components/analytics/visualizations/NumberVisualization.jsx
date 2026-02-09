import { Box, Typography } from '@mui/material';
import HistogramChart from '../charts/HistogramChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformNumberData } from '~/utils/analytics/dataTransformers';

export default function NumberVisualization({ question }) {
  const data = transformNumberData(question);

  const stats = [
    { label: 'Mean', value: data.stats.mean, color: 'blue' },
    { label: 'Median', value: data.stats.median, color: 'purple' },
    { label: 'Std Dev', value: data.stats.stdDev, color: 'gray' },
    { label: 'Range', value: `${data.stats.min} - ${data.stats.max}`, color: 'green' },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Histogram */}
        <HistogramChart
          data={data.histogramData}
          stats={data.stats}
          height={300}
          showStats={false}
        />

        {/* Additional Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 2,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Mode
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {data.stats.mode}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Count
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {data.stats.count}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Sum
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {data.stats.sum}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Range
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {data.stats.range}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ChartContainer>
  );
}
