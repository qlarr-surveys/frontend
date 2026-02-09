import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import StackedBarChart from '../charts/StackedBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { transformMatrixSCQData } from '~/utils/analytics/dataTransformers';
import { LIKERT_COLORS } from '~/utils/analytics/colors';

export default function MatrixSCQVisualization({ question }) {
  const [viewType, setViewType] = useState('heatmap');
  const data = transformMatrixSCQData(question);

  const tabs = [
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'stacked', label: 'Stacked Bar' },
  ];

  // Calculate highest rated row
  const highestRated = data.rowAverages.reduce(
    (max, row) => (parseFloat(row.average) > parseFloat(max.average) ? row : max),
    { average: 0 }
  );

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Rows', value: data.rows.length, color: 'purple' },
    { label: 'Columns', value: data.columns.length, color: 'gray' },
    {
      label: 'Highest Rated',
      value: highestRated.row || '-',
      description: `Avg: ${highestRated.average}`,
      color: 'green',
    },
  ];

  // Prepare stacked bar data
  const stackedData = data.heatmapData.map((rowData) => {
    const result = { option: rowData.row };
    data.columns.forEach((col) => {
      result[col] = rowData[col] || 0;
    });
    return result;
  });

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
      actions={<ChartTabs tabs={tabs} activeTab={viewType} onChange={setViewType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Chart */}
        {viewType === 'heatmap' && (
          <HeatmapChart
            data={data.heatmapData}
            rows={data.rows}
            columns={data.columns}
            cellSize={60}
            showValues={true}
          />
        )}

        {viewType === 'stacked' && (
          <StackedBarChart
            data={stackedData}
            keys={data.columns}
            colors={Object.values(LIKERT_COLORS)}
            height={350}
            layout="vertical"
          />
        )}

        {/* Row Averages */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Row Averages
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
            {data.rowAverages.map((row, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {row.row}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {row.average}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </ChartContainer>
  );
}
