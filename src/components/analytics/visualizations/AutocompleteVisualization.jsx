import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformAutocompleteData } from '~/utils/analytics/dataTransformers';

export default function AutocompleteVisualization({ question }) {
  const [chartType, setChartType] = useState('bar');
  const data = useMemo(() => transformAutocompleteData(question), [question]);

  const tabs = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'pie', label: 'Pie Chart' },
  ];

  const stats = [
    ...buildBaseStats(data),
    { label: 'Most Selected', value: data.mode },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={chartType} onChange={setChartType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={2} />
        <Box sx={{ minHeight: 300 }}>
          {chartType === 'bar' && <HorizontalBarChart data={data.barData} height={300} />}
          {chartType === 'pie' && <PieDonutChart data={data.pieData} height={350} />}
        </Box>
      </Box>
    </ChartContainer>
  );
}
