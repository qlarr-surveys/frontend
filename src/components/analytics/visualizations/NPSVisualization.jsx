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
      color: data.score >= 30 ? 'green' : data.score >= 0 ? 'yellow' : 'red',
      description: getNPSBenchmarkLabel(data.score),
    },
    {
      label: 'Promoters',
      value: `${data.promoterPct}%`,
      description: `${data.promoters} responses`,
      color: 'green',
    },
    {
      label: 'Passives',
      value: `${data.passivePct}%`,
      description: `${data.passives} responses`,
      color: 'yellow',
    },
    {
      label: 'Detractors',
      value: `${data.detractorPct}%`,
      description: `${data.detractors} responses`,
      color: 'red',
    },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <NPSChart
          score={data.score}
          categoryData={data.categoryData}
          distributionData={data.distributionData}
        />
      </Box>
    </ChartContainer>
  );
}
