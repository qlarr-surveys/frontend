import { useState } from 'react';
import { Box } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { transformAutocompleteData } from '~/utils/analytics/dataTransformers';

export default function AutocompleteVisualization({ question }) {
  const [chartType, setChartType] = useState('bar');
  const data = transformAutocompleteData(question);

  const tabs = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'pie', label: 'Pie Chart' },
  ];

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Most Selected', value: data.mode, color: 'green' },
    { label: 'Mode Count', value: data.modeCount, color: 'purple' },
    { label: 'Options', value: question.options.length, color: 'gray' },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
      actions={<ChartTabs tabs={tabs} activeTab={chartType} onChange={setChartType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <Box sx={{ minHeight: 300 }}>
          {chartType === 'bar' && <HorizontalBarChart data={data.barData} height={300} />}
          {chartType === 'pie' && <PieDonutChart data={data.pieData} donut={true} height={350} />}
        </Box>
      </Box>
    </ChartContainer>
  );
}
