import { Box, Typography } from '@mui/material';
import RankingChart from '../charts/RankingChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { RankedImageGallery } from '../common/ImageGallery';
import { transformImageRankingData } from '~/utils/analytics/dataTransformers';

export default function ImageRankingVisualization({ question }) {
  const data = transformImageRankingData(question);

  const topItem = data.rankedImages[0];
  const bottomItem = data.rankedImages[data.rankedImages.length - 1];

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Answered', value: data.answered, description: `${data.skipped} skipped`, color: 'green' },
    {
      label: 'Most Preferred',
      value: topItem?.name || '-',
      description: `Avg rank: ${topItem?.averageRank}`,
      color: 'purple',
    },
    {
      label: 'Least Preferred',
      value: bottomItem?.name || '-',
      description: `Avg rank: ${bottomItem?.averageRank}`,
      color: 'red',
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <RankedImageGallery images={data.rankedImages} showAverageRank={true} />
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Lower average rank indicates higher preference (1 = most preferred)
        </Typography>
      </Box>
    </ChartContainer>
  );
}
