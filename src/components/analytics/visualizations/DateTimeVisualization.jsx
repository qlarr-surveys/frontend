import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import FrequencyTable from '../common/FrequencyTable';
import HistogramChart from '../charts/HistogramChart';
import { transformDateTimeData } from '~/utils/analytics/dataTransformers';

export default function DateTimeVisualization({ question }) {
  const data = useMemo(() => transformDateTimeData(question), [question]);
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const [viewType, setViewType] = useState('timeline');

  const tabs = [
    { value: 'timeline', label: t('analytics.tab_timeline') },
    { value: 'hourly', label: t('analytics.tab_hourly') },
    { value: 'table', label: t('analytics.tab_table') },
  ];

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.stat_earliest'), value: data.earliest },
    { label: t('analytics.stat_latest'), value: data.latest },
    { label: t('analytics.stat_peak_hour'), value: data.peakHour },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={viewType} onChange={setViewType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={3} />

        {viewType === 'timeline' && data.timelineData.length > 0 && (
          <HistogramChart
            data={data.timelineData}
            height={300}
            rotateLabels={data.timelineData.length > 6}
          />
        )}

        {viewType === 'hourly' && (
          <HistogramChart
            data={data.hourlyDistribution}
            height={280}
            rotateLabels
          />
        )}

        {viewType === 'table' && (
          <FrequencyTable data={data.frequencyData} valueLabel={t('analytics.col_date_time')} />
        )}
      </Box>
    </ChartContainer>
  );
}
