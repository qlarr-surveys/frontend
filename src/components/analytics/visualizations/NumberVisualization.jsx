import { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import DataTable from '../common/DataTable';
import HistogramChart from '../charts/HistogramChart';
import { transformNumberData } from '~/utils/analytics/dataTransformers';
import { formatNumber } from '~/utils/analytics/formatting';

export default function NumberVisualization({ question }) {
  const data = useMemo(() => transformNumberData(question), [question]);
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const [viewType, setViewType] = useState('chart');
  const hasOutliers = data.outlierData.outliersCount > 0;

  const tabs = [
    { value: 'chart', label: t('analytics.tab_chart') },
    { value: 'table', label: t('analytics.tab_table') },
  ];

  // Build table data
  const tableData = useMemo(() => {
    const valueCounts = {};

    question.responses.forEach((value) => {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    return Object.entries(valueCounts).map(([value, count]) => ({
      rawValue: parseFloat(value),
      value: formatNumber(parseFloat(value), { context: 'full', decimals: 2 }),
      frequency: count,
      percentage: `${((count / data.stats.count) * 100).toFixed(1)}%`,
    }));
  }, [question.responses, data.stats.count]);

  const columns = [
    { key: 'value', label: t('analytics.col_value'), sortable: true, align: 'right' },
    { key: 'frequency', label: t('analytics.col_frequency'), sortable: true, align: 'right' },
    { key: 'percentage', label: t('analytics.col_percentage'), sortable: true, align: 'right' },
  ];

  const highlightRow = (row) => data.outlierData.outliers.includes(row.rawValue);

  const stats = [
    {
      label: t('analytics.stat_responses'),
      value: `${data.answered} / ${data.total}`,
    },
    {
      label: t('analytics.stat_mean'),
      value: formatNumber(data.stats.mean, { context: 'full', decimals: 2 }),
    },
    {
      label: t('analytics.stat_median'),
      value: formatNumber(data.stats.median, { context: 'full', decimals: 2 }),
    },
    {
      label: t('analytics.stat_range'),
      value: `${formatNumber(data.stats.min, { context: 'full', decimals: 2 })} - ${formatNumber(
        data.stats.max,
        { context: 'full', decimals: 2 }
      )}`,
    },
    {
      label: t('analytics.stat_std_dev'),
      value: formatNumber(data.stats.stdDev, { context: 'full', decimals: 2 }),
    },
    {
      label: t('analytics.stat_mode'),
      value: formatNumber(data.stats.mode, { context: 'full', decimals: 2 }),
    },
    {
      label: t('analytics.stat_sum'),
      value: formatNumber(data.stats.sum, { context: 'full', decimals: 2 }),
    },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={viewType} onChange={setViewType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />

        {hasOutliers && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'warning.light',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'warning.main',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {data.outlierData.outliersCount > 1
                ? t('analytics.outlier_message_other', { count: data.outlierData.outliersCount })
                : t('analytics.outlier_message_one', { count: data.outlierData.outliersCount })}
            </Typography>
          </Box>
        )}

        {viewType === 'chart' && data.histogramData.length > 0 && (
          <HistogramChart
            data={data.histogramData}
            height={300}
            rotateLabels={data.histogramData.length > 8}
          />
        )}

        {viewType === 'table' && (
          <DataTable
            data={tableData}
            columns={columns}
            searchable={true}
            paginated={true}
            rowsPerPage={20}
            highlightRow={highlightRow}
            emptyMessage={t('analytics.no_numeric_data')}
          />
        )}
      </Box>
    </ChartContainer>
  );
}
