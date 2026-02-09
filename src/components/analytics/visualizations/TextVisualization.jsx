import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import FrequencyTable from '../common/FrequencyTable';
import { transformTextData } from '~/utils/analytics/dataTransformers';

export default function TextVisualization({ question }) {
  const data = transformTextData(question);

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Unique Responses', value: data.uniqueCount, color: 'purple' },
    { label: 'Avg Length', value: `${data.avgLength} chars`, color: 'gray' },
    {
      label: 'Most Common',
      value: data.frequencyData[0]?.value || '-',
      description: `${data.frequencyData[0]?.count || 0} times`,
      color: 'green',
    },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <FrequencyTable
          data={data.frequencyData.slice(0, 15)}
          valueLabel="Response"
          countLabel="Count"
        />
      </Box>
    </ChartContainer>
  );
}
