import { Box, Typography } from '@mui/material';
import RankingChart from '../charts/RankingChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformRankingData } from '~/utils/analytics/dataTransformers';

export default function RankingVisualization({ question }) {
  const data = transformRankingData(question);

  const topItem = data.averageRankData[0];
  const bottomItem = data.averageRankData[data.averageRankData.length - 1];

  const stats = [
    ...buildBaseStats(data),
    {
      label: 'Most Preferred',
      value: topItem?.name || '-',
      description: `Avg rank: ${topItem?.averageRank}`,
    },
    {
      label: 'Least Preferred',
      value: bottomItem?.name || '-',
      description: `Avg rank: ${bottomItem?.averageRank}`,
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Ranking Chart */}
        <RankingChart data={data.averageRankData} height={350} showFirstLast={true} />

        {/* Note */}
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Lower average rank indicates higher preference (1 = most preferred)
        </Typography>
      </Box>
    </ChartContainer>
  );
}
