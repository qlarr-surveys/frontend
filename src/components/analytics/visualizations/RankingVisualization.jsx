import { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import RankingChart from '../charts/RankingChart';
import RankDistributionChart from '../charts/RankDistributionChart';
import ChartContainer from '../common/ChartContainer';
import ChartTabs from '../common/ChartTabs';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformRankingData } from '~/utils/analytics/dataTransformers';

export default function RankingVisualization({ question }) {
  const data = useMemo(() => transformRankingData(question), [question]);
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const [chartType, setChartType] = useState('avgRank');

  const topItem = data.averageRankData[0];
  const bottomItem = data.averageRankData[data.averageRankData.length - 1];

  const tabs = [
    { value: 'avgRank', label: t('analytics.tab_avg_rank') },
    { value: 'distribution', label: t('analytics.tab_rank_distribution') },
  ];

  const stats = [
    ...buildBaseStats(data, t),
    {
      label: t('analytics.most_preferred'),
      value: topItem?.name || '-',
      description: t('analytics.avg_rank_colon', { rank: topItem?.averageRank }),
    },
    {
      label: t('analytics.least_preferred'),
      value: bottomItem?.name || '-',
      description: t('analytics.avg_rank_colon', { rank: bottomItem?.averageRank }),
    },
  ];

  // Extract rank keys from distribution data
  const ranks = useMemo(() => {
    if (data.rankDistribution.length === 0) return [];
    return Object.keys(data.rankDistribution[0]).filter((k) => k !== 'option');
  }, [data.rankDistribution]);

  return (
    <ChartContainer
      actions={<ChartTabs tabs={tabs} activeTab={chartType} onChange={setChartType} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} />

        {chartType === 'avgRank' && (
          <>
            <RankingChart data={data.averageRankData} height={350} showFirstLast={true} />
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              {t('analytics.ranking_note')}
            </Typography>
          </>
        )}

        {chartType === 'distribution' && ranks.length > 0 && (
          <RankDistributionChart
            data={data.rankDistribution}
            ranks={ranks}
            height={350}
          />
        )}
      </Box>
    </ChartContainer>
  );
}
