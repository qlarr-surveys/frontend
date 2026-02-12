import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import DataTable from '../common/DataTable';
import { transformNumberData } from '~/utils/analytics/dataTransformers';
import { formatNumber } from '~/utils/analytics/formatting';

export default function NumberVisualization({ question }) {
  const data = transformNumberData(question);
  const hasOutliers = data.outlierData.outliersCount > 0;

  // Build table data
  const tableData = useMemo(() => {
    const valueCounts = {};

    // Count frequency of each value
    question.responses.forEach((value) => {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    // Build table rows
    return Object.entries(valueCounts).map(([value, count]) => ({
      rawValue: parseFloat(value),
      value: formatNumber(parseFloat(value), { context: 'full', decimals: 2 }),
      frequency: count,
      percentage: `${((count / data.stats.count) * 100).toFixed(1)}%`,
    }));
  }, [question.responses, data.stats.count]);

  // Define columns
  const columns = [
    { key: 'value', label: 'Value', sortable: true, align: 'right' },
    { key: 'frequency', label: 'Frequency', sortable: true, align: 'right' },
    { key: 'percentage', label: 'Percentage', sortable: true, align: 'right' },
  ];

  // Highlight outliers
  const highlightRow = (row) => data.outlierData.outliers.includes(row.rawValue);

  // Primary stats
  const stats = [
    {
      label: 'Responses',
      value: `${data.answered} / ${data.total}`,
      description: `${data.skipped} skipped`,
      color: 'blue',
    },
    {
      label: 'Mean',
      value: formatNumber(data.stats.mean, { context: 'full', decimals: 2 }),
      color: 'purple',
    },
    {
      label: 'Median',
      value: formatNumber(data.stats.median, { context: 'full', decimals: 2 }),
      color: 'gray',
    },
    {
      label: 'Range',
      value: `${formatNumber(data.stats.min, { context: 'full', decimals: 2 })} - ${formatNumber(
        data.stats.max,
        { context: 'full', decimals: 2 }
      )}`,
      color: 'green',
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Outlier Summary */}
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
              ⚠️ {data.outlierData.outliersCount} outlier
              {data.outlierData.outliersCount > 1 ? 's' : ''} detected (highlighted in red below)
            </Typography>
          </Box>
        )}

        {/* Data Table */}
        <DataTable
          data={tableData}
          columns={columns}
          searchable={true}
          paginated={true}
          rowsPerPage={20}
          highlightRow={highlightRow}
          emptyMessage="No numeric data available"
        />
      </Box>
    </ChartContainer>
  );
}
