import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import FrequencyTable from '../common/FrequencyTable';
import { transformParagraphData } from '~/utils/analytics/dataTransformers';

export default function ParagraphVisualization({ question }) {
  const data = transformParagraphData(question);

  const mostCommon = data.frequencyData[0]?.value || '-';
  const truncatedMostCommon = mostCommon.length > 30 ? `${mostCommon.slice(0, 30)}...` : mostCommon;

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Unique Responses', value: data.uniqueCount, color: 'purple' },
    { label: 'Avg Length', value: `${data.avgLength} chars`, color: 'gray' },
    {
      label: 'Most Common',
      value: truncatedMostCommon,
      description: `${data.frequencyData[0]?.count || 0} times`,
      color: 'green',
    },
  ];

  return (
    <ChartContainer>
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
