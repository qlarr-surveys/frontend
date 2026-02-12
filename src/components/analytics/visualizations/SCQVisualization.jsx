import { useState } from 'react';
import { Box } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { transformSCQData } from '~/utils/analytics/dataTransformers';

export default function SCQVisualization({ question }) {
  const [chartType, setChartType] = useState('pie');
  const data = transformSCQData(question);

  const tabs = [
    { value: 'pie', label: 'Pie' },
    { value: 'donut', label: 'Donut' },
    { value: 'bar', label: 'Bar' },
  ];

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Answered', value: data.answered, description: `${data.skipped} skipped`, color: 'green' },
    { label: 'Most Selected', value: data.mode, color: 'purple' },
    { label: 'Options', value: question.options?.length ?? 0, color: 'gray' },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={chartType} onChange={setChartType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Chart */}
        <Box sx={{ minHeight: 300 }}>
          {chartType === 'pie' && (
            <PieDonutChart data={data.pieData} donut={false} height={350} />
          )}
          {chartType === 'donut' && (
            <PieDonutChart data={data.pieData} donut={true} height={350} />
          )}
          {chartType === 'bar' && (
            <HorizontalBarChart data={data.barData} height={300} />
          )}
        </Box>
      </Box>
    </ChartContainer>
  );
}
