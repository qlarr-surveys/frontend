import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import DataTable from '../common/DataTable';
import { useWorkerTransform } from '~/hooks/useWorkerTransform';

export default function MCQVisualization({ question }) {
  const [chartType, setChartType] = useState('donut');
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const { data, loading } = useWorkerTransform('transformMCQData', question);
  if (loading || !data) return null;

  const tabs = [
    { value: 'donut', label: t('analytics.tab_donut') },
    { value: 'bar', label: t('analytics.tab_bar') },
  ];

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.most_popular'), value: data.barData[0]?.name || '-' },
    { label: t('analytics.stat_avg_selections'), value: data.avgSelections },
  ];

  const tableData = data.barData.map((item) => ({
    option: item.name,
    count: item.count,
    percentage: `${item.percentage}%`,
  }));

  const tableColumns = [
    { key: 'option', label: t('analytics.col_option'), sortable: true },
    { key: 'count', label: t('analytics.col_count'), sortable: true, align: 'right' },
    { key: 'percentage', label: t('analytics.col_percentage'), sortable: true, align: 'right' },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={chartType} onChange={setChartType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={3} />

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
            {t('analytics.option_breakdown')}
          </Typography>
          <DataTable
            data={tableData}
            columns={tableColumns}
            searchable={data.barData.length > 10}
            paginated={data.barData.length > 20}
            rowsPerPage={20}
            emptyMessage={t('analytics.no_selection_data')}
          />
        </Box>
      </Box>
    </ChartContainer>
  );
}
