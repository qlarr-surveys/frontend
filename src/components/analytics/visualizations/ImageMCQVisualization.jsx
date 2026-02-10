import { Box, Typography } from '@mui/material';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import ImageGallery from '../common/ImageGallery';
import CategoryLegend from '../common/CategoryLegend';
import { transformImageMCQData } from '~/utils/analytics/dataTransformers';

export default function ImageMCQVisualization({ question }) {
  const data = transformImageMCQData(question);

  const stats = [
    { label: 'Total Respondents', value: data.total, color: 'blue' },
    { label: 'Avg Selections', value: data.avgSelections, color: 'purple' },
    { label: 'Most Popular', value: data.barData[0]?.name || '-', color: 'green' },
    { label: 'Images', value: question.images.length, color: 'gray' },
  ];

  const galleryImages = question.images.map((img) => {
    const barItem = data.barData.find((b) => b.name === img.label);
    return {
      ...img,
      count: barItem?.count || 0,
      percentage: barItem?.percentage || 0,
      color: barItem?.fill,
    };
  });

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
          <CategoryLegend items={data.barData} showPercentage={true} />
        </Box>
      </Box>
    </ChartContainer>
  );
}
