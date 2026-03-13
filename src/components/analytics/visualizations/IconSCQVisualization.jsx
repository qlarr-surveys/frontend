import { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import ImageGallery from '../common/ImageGallery';
import IconLegend from '../common/IconLegend';
import { resolveImageUrl } from '~/utils/analytics/dataTransformers';
import { useWorkerTransform } from '~/hooks/useWorkerTransform';

export default function IconSCQVisualization({ question }) {
  const [viewType, setViewType] = useState('gallery');
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const { data, loading } = useWorkerTransform('transformIconSCQData', question);
  if (loading || !data) return null;
  const images = question.images || [];

  const tabs = [
    { value: 'gallery', label: t('analytics.tab_gallery') },
    { value: 'donut', label: t('analytics.tab_donut') },
    { value: 'bar', label: t('analytics.tab_bar') },
  ];

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.most_selected'), value: data.mode || '-' },
  ];

  const galleryImages = images.map((img, i) => {
    const pieItem = data.pieData[i];
    return {
      ...img,
      url: resolveImageUrl(img.url),
      label: img.label || t('analytics.option_fallback', { index: i + 1 }),
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
        <StatsRow stats={stats} columns={2} />

        {viewType === 'gallery' && (
          <ImageGallery images={galleryImages} columns={3} showLabels={true} showStats={true} />
        )}

        {viewType === 'donut' && (
          <>
            <PieDonutChart data={data.pieData} height={350} showLegend={false} />
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
