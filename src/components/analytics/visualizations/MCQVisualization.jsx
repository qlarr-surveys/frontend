import { Box, Typography } from '@mui/material';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import CategoryLegend from '../common/CategoryLegend';
import { transformMCQData } from '~/utils/analytics/dataTransformers';

export default function MCQVisualization({ question }) {
  const data = transformMCQData(question);

  const stats = [
    { label: 'Total Respondents', value: data.total, color: 'blue' },
    { label: 'Avg Selections', value: data.avgSelections, color: 'purple' },
    { label: 'Most Popular', value: data.barData[0]?.name || '-', color: 'green' },
    { label: 'Options', value: question.options.length, color: 'gray' },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Bar Chart */}
        <HorizontalBarChart data={data.barData} height={Math.max(300, data.barData.length * 50)} />

        {/* Legend with percentages */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Selection Frequency
          </Typography>
          <CategoryLegend items={data.barData} showPercentage={true} />
        </Box>
      </Box>
    </ChartContainer>
  );
}
