import { useState } from 'react';
import { Box } from '@mui/material';
import TimelineChart from '../charts/TimelineChart';
import PieDonutChart from '../charts/PieDonutChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { transformTimeData } from '~/utils/analytics/dataTransformers';

export default function TimeVisualization({ question }) {
  const [viewType, setViewType] = useState('hour');
  const data = transformTimeData(question);

  const tabs = [
    { value: 'hour', label: 'By Hour' },
    { value: 'period', label: 'By Period' },
  ];

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Peak Hour', value: data.peakHour, color: 'green' },
    { label: 'Morning', value: data.periodData[0]?.count || 0, color: 'yellow' },
    { label: 'Afternoon', value: data.periodData[1]?.count || 0, color: 'purple' },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={viewType} onChange={setViewType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Chart */}
        <Box sx={{ minHeight: 300 }}>
          {viewType === 'hour' && (
            <TimelineChart
              data={data.hourData}
              type="bar"
              height={300}
              xAxisLabel="Hour"
            />
          )}
          {viewType === 'period' && (
            <PieDonutChart
              data={data.periodData.map((d) => ({ ...d, value: d.count }))}
              donut={true}
              height={350}
            />
          )}
        </Box>
      </Box>
    </ChartContainer>
  );
}
