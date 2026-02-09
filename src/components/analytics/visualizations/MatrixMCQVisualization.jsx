import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import HeatmapChart from '../charts/HeatmapChart';
import StackedBarChart from '../charts/StackedBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { transformMatrixMCQData } from '~/utils/analytics/dataTransformers';

export default function MatrixMCQVisualization({ question }) {
  const [viewType, setViewType] = useState('heatmap');
  const data = transformMatrixMCQData(question);

  const tabs = [
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'stacked', label: 'Stacked Bar' },
  ];

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Rows', value: data.rows.length, color: 'purple' },
    { label: 'Columns', value: data.columns.length, color: 'gray' },
    { label: 'Avg Selections', value: data.avgSelections, color: 'green' },
  ];

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
        <StatsRow stats={stats} columns={4} />
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
            height={350}
            layout="vertical"
          />
        )}
      </Box>
    </ChartContainer>
  );
}
