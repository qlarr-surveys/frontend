import { Box, Typography } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import ImageGallery from '../common/ImageGallery';
import IconLegend from '../common/IconLegend';
import { transformIconMCQData, resolveImageUrl } from '~/utils/analytics/dataTransformers';

export default function IconMCQVisualization({ question }) {
  const data = transformIconMCQData(question);
  const images = question.images || [];

  const stats = [
    ...buildBaseStats(data),
    { label: 'Most Popular', value: data.barData[0]?.name || '-' },
    { label: 'Options', value: images.length },
  ];

  const galleryImages = images.map((img, i) => {
    const barItem = data.barData.find((d) => d.name === img.label);
    return {
      ...img,
      url: resolveImageUrl(img.url),
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


        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Selection Frequency
          </Typography>
          <IconLegend items={data.barData} />
        </Box>
      </Box>
    </ChartContainer>
  );
}
