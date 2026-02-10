import { useState } from 'react';
import { Box } from '@mui/material';
import TimelineChart from '../charts/TimelineChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { transformDateData } from '~/utils/analytics/dataTransformers';

export default function DateVisualization({ question }) {
  const [viewType, setViewType] = useState('month');
  const data = transformDateData(question);

  const tabs = [
    { value: 'month', label: 'By Month' },
    { value: 'dayOfWeek', label: 'By Day' },
  ];

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Earliest', value: data.dateRange.earliest || '-', color: 'green' },
    { label: 'Latest', value: data.dateRange.latest || '-', color: 'purple' },
    { label: 'Unique Months', value: data.monthData.length, color: 'gray' },
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
          {viewType === 'month' && (
            <TimelineChart
              data={data.monthData}
              type="bar"
              height={300}
              xAxisLabel="Month"
            />
          )}
          {viewType === 'dayOfWeek' && (
            <TimelineChart
              data={data.dayOfWeekData}
              type="bar"
              height={300}
              xAxisLabel="Day of Week"
            />
          )}
        </Box>
      </Box>
    </ChartContainer>
  );
}
