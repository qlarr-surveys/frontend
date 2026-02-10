import { Box, Typography } from '@mui/material';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import ImageGallery from '../common/ImageGallery';
import IconLegend from '../common/IconLegend';
import DataTable from '../common/DataTable';
import { transformIconMCQData } from '~/utils/analytics/dataTransformers';
import { BACKEND_BASE_URL } from '~/constants/networking';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return BACKEND_BASE_URL + url.replace(/^\//, '');
};

export default function IconMCQVisualization({ question }) {
  const data = transformIconMCQData(question);
  const images = question.images || [];

  const stats = [
    { label: 'Total Respondents', value: data.total, color: 'blue' },
    { label: 'Avg Selections', value: data.avgSelections, color: 'purple' },
    { label: 'Most Popular', value: data.barData[0]?.name || '-', color: 'green' },
    { label: 'Options', value: images.length, color: 'gray' },
  ];

  const galleryImages = images.map((img, i) => {
    const barItem = data.barData[i];
    return {
      ...img,
      url: resolveUrl(img.url),
      label: img.label || `Option ${i + 1}`,
      count: barItem?.count || 0,
      percentage: barItem?.percentage || 0,
      color: barItem?.fill,
    };
  });

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
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />

        <ImageGallery images={galleryImages} columns={4} showLabels={true} showStats={true} />

        <HorizontalBarChart data={data.barData} height={Math.max(300, data.barData.length * 50)} />

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Selection Frequency
          </Typography>
          <IconLegend items={data.barData} />
        </Box>

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
