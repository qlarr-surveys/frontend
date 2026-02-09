import { Box, Typography, Grid } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformEmailData } from '~/utils/analytics/dataTransformers';

export default function EmailVisualization({ question }) {
  const data = transformEmailData(question);

  const stats = [
    { label: 'Total Emails', value: data.total, color: 'blue' },
    { label: 'Unique Domains', value: data.uniqueDomains, color: 'purple' },
    { label: 'Invalid Emails', value: data.invalidCount, color: 'red' },
    {
      label: 'Top Domain',
      value: data.domainData[0]?.name || '-',
      description: `${data.domainData[0]?.count || 0} emails`,
      color: 'green',
    },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={4} />

        {/* Charts Side by Side */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
              Domain Distribution
            </Typography>
            <PieDonutChart
              data={data.domainData.slice(0, 6).map((d) => ({ ...d, value: d.count }))}
              donut={true}
              height={280}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
              Top Domains
            </Typography>
            <HorizontalBarChart data={data.domainData.slice(0, 8)} height={280} />
          </Grid>
        </Grid>
      </Box>
    </ChartContainer>
  );
}
