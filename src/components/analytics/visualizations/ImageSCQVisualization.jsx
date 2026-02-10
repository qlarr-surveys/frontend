import { useState } from 'react';
import { Box } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import ImageGallery from '../common/ImageGallery';
import { transformImageSCQData } from '~/utils/analytics/dataTransformers';

export default function ImageSCQVisualization({ question }) {
  const [viewType, setViewType] = useState('gallery');
  const data = transformImageSCQData(question);

  const tabs = [
    { value: 'gallery', label: 'Gallery' },
    { value: 'pie', label: 'Pie Chart' },
  ];

  const topChoice = data.pieData[0];

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Images', value: question.images.length, color: 'purple' },
    {
      label: 'Most Selected',
      value: topChoice?.name || '-',
      description: `${topChoice?.percentage}%`,
      color: 'green',
    },
  ];

  // Prepare gallery data with stats
  const galleryImages = question.images.map((img) => {
    const pieItem = data.pieData.find((p) => p.name === img.label);
    return {
      ...img,
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
        {/* Stats Row */}
        <StatsRow stats={stats} columns={3} />

        {/* Visualization */}
        {viewType === 'gallery' && (
          <ImageGallery
            images={galleryImages}
            columns={4}
            showLabels={true}
            showStats={true}
          />
        )}

        {viewType === 'pie' && (
          <PieDonutChart data={data.pieData} donut={true} height={350} />
        )}
      </Box>
    </ChartContainer>
  );
}
