import { Box, Typography } from '@mui/material';
import NPSChart from '../charts/NPSChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformNPSData } from '~/utils/analytics/dataTransformers';

export default function NPSVisualization({ question }) {
  const data = transformNPSData(question);

  const stats = [
    {
      label: 'NPS Score',
      value: data.score,
      color: data.score >= 0 ? 'green' : 'red',
      description: data.score >= 50 ? 'Excellent' : data.score >= 0 ? 'Good' : 'Needs Improvement',
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
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* NPS Chart with all views */}
        <NPSChart
          score={data.score}
          categoryData={data.categoryData}
          distributionData={data.distributionData}
          gaugeSize={220}
        />

        {/* Interpretation */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
            Understanding NPS
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, fontSize: 14 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Detractors (0-6): Unlikely to recommend
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Passives (7-8): Satisfied but unenthusiastic
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Promoters (9-10): Loyal enthusiasts
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ChartContainer>
  );
}
