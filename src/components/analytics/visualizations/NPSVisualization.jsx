import { Box } from '@mui/material';
import NPSChart from '../charts/NPSChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformNPSData } from '~/utils/analytics/dataTransformers';

const getNPSBenchmarkLabel = (score) => {
  if (score >= 70) return 'Excellent';
  if (score >= 30) return 'Great';
  if (score >= 0) return 'Good';
  return 'Needs Improvement';
};

export default function NPSVisualization({ question }) {
  const data = transformNPSData(question);

  const stats = [
    {
      label: 'NPS Score',
      value: data.score,
      description: getNPSBenchmarkLabel(data.score),
    },
    {
      label: 'Promoters',
      value: `${data.promoterPct}%`,
      description: `${data.promoters} responses`,
    },
    {
      label: 'Passives',
      value: `${data.passivePct}%`,
      description: `${data.passives} responses`,
    },
    {
      label: 'Detractors',
      value: `${data.detractorPct}%`,
      description: `${data.detractors} responses`,
    },
    {
      label: 'Response Rate',
      value: `${data.responseRate}%`,
      description: `${data.answered} of ${data.total}`,
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={5} />
        <NPSChart
          score={data.score}
          categoryData={data.categoryData}
          distributionData={data.distributionData}
        />
      </Box>
    </ChartContainer>
  );
}
