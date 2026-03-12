import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import DataTable from '../common/DataTable';
import { transformMCQData } from '~/utils/analytics/dataTransformers';

export default function MCQVisualization({ question }) {
  const [chartType, setChartType] = useState('donut');
  const data = transformMCQData(question);

  const tabs = [
    { value: 'donut', label: 'Donut' },
    { value: 'bar', label: 'Bar' },
  ];

  const stats = [
    ...buildBaseStats(data),
    { label: 'Most Popular', value: data.barData[0]?.name || '-' },
  ];

  const tableData = data.barData.map((item) => ({
    option: item.name,
    count: item.count,
    percentage: `${item.percentage}%`,
  }));

  const tableColumns = [
    { key: 'option', label: 'Option', sortable: true },
    { key: 'count', label: 'Count', sortable: true, align: 'right' },
    { key: 'percentage', label: 'Percentage', sortable: true, align: 'right' },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={chartType} onChange={setChartType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={2} />

        {/* Chart */}
        <Box sx={{ minHeight: 300 }}>
          {chartType === 'donut' && (
            <PieDonutChart data={data.pieData} height={350} />
          )}
          {chartType === 'bar' && (
            <HorizontalBarChart data={data.barData} height={300} />
          )}
        </Box>

        {/* Option Breakdown Table */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Option Breakdown
          </Typography>
          <DataTable
            data={tableData}
            columns={tableColumns}
            searchable={data.barData.length > 10}
            paginated={data.barData.length > 20}
            rowsPerPage={20}
            emptyMessage="No selection data available"
          />
        </Box>
      </Box>
    </ChartContainer>
  );
}
