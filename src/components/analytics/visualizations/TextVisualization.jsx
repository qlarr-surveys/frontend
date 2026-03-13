import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import FrequencyTable from '../common/FrequencyTable';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import HistogramChart from '../charts/HistogramChart';
import { transformTextData } from '~/utils/analytics/dataTransformers';

export default function TextVisualization({ question }) {
  const data = useMemo(() => transformTextData(question), [question]);
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const [viewType, setViewType] = useState('frequency');

  const tabs = [
    { value: 'frequency', label: t('analytics.tab_frequency') },
    { value: 'length', label: t('analytics.tab_length_dist') },
    { value: 'table', label: t('analytics.tab_table') },
  ];

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.unique_responses'), value: data.uniqueCount },
    { label: t('analytics.avg_length'), value: t('analytics.chars', { length: data.avgLength }) },
  ];

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={viewType} onChange={setViewType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={3} />

        {viewType === 'frequency' && data.topResponses.length > 0 && (
          <HorizontalBarChart
            data={data.topResponses}
            height={300}
          />
        )}

        {viewType === 'length' && (
          <HistogramChart
            data={data.lengthDistribution}
            height={280}
            xLabel={t('analytics.response_length')}
          />
        )}

        {viewType === 'table' && (
          <FrequencyTable
            data={data.frequencyData}
            valueLabel={t('analytics.col_response')}
            countLabel={t('analytics.col_count')}
          />
        )}
      </Box>
    </ChartContainer>
  );
}
