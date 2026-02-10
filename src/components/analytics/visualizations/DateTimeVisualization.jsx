import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformDateTimeData } from '~/utils/analytics/dataTransformers';

export default function DateTimeVisualization({ question }) {
  const data = transformDateTimeData(question);

  // Reshape data for heatmap (7 days x 24 hours)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // Group heatmap data by day
  const heatmapRows = days.map((day) => {
    const row = { row: day };
    hours.forEach((hour) => {
      const item = data.heatmapData.find((d) => d.day === day && d.hour === hour);
      row[hour] = item?.count || 0;
    });
    return row;
  });

  // Find peak day/hour
  const peakItem = data.heatmapData.reduce(
    (max, item) => (item.count > max.count ? item : max),
    { count: 0 }
  );

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Peak Day', value: peakItem.day || '-', color: 'green' },
    { label: 'Peak Hour', value: peakItem.hour || '-', color: 'purple' },
    { label: 'Peak Count', value: peakItem.count, color: 'gray' },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Heatmap */}
        <Box sx={{ overflowX: 'auto' }}>
          <HeatmapChart
            data={heatmapRows}
            rows={days}
            columns={hours}
            cellSize={30}
            showValues={false}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Heatmap showing response frequency by day and hour
        </Typography>
      </Box>
    </ChartContainer>
  );
}
