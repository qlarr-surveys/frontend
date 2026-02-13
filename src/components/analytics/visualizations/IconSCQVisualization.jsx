import { useState } from 'react';
import { Box } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import ImageGallery from '../common/ImageGallery';
import IconLegend from '../common/IconLegend';
import { transformIconSCQData, resolveImageUrl } from '~/utils/analytics/dataTransformers';

export default function IconSCQVisualization({ question }) {
  const [viewType, setViewType] = useState('gallery');
  const data = transformIconSCQData(question);
  const images = question.images || [];

  const tabs = [
    { value: 'gallery', label: 'Gallery' },
    { value: 'pie', label: 'Pie' },
    { value: 'donut', label: 'Donut' },
    { value: 'bar', label: 'Bar' },
  ];

  const stats = [
    ...buildBaseStats(data),
    { label: 'Most Selected', value: data.mode || '-' },
    { label: 'Options', value: images.length },
  ];

  const galleryImages = images.map((img, i) => {
    const pieItem = data.pieData[i];
    return {
      ...img,
      url: resolveImageUrl(img.url),
      label: img.label || `Option ${i + 1}`,
      count: pieItem?.value || 0,
      percentage: pieItem?.percentage || 0,
      color: pieItem?.fill,
    };
  });

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={viewType} onChange={setViewType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />

        {viewType === 'gallery' && (
          <ImageGallery images={galleryImages} columns={4} showLabels={true} showStats={true} />
        )}

        {viewType === 'pie' && (
          <>
            <PieDonutChart data={data.pieData} donut={false} height={350} showLegend={false} />
            <IconLegend items={data.pieData} />
          </>
        )}

        {viewType === 'donut' && (
          <>
            <PieDonutChart data={data.pieData} donut={true} height={350} showLegend={false} />
            <IconLegend items={data.pieData} />
          </>
        )}

        {viewType === 'bar' && (
          <HorizontalBarChart data={data.barData} height={Math.max(300, data.barData.length * 50)} />
        )}
      </Box>
    </ChartContainer>
  );
}
