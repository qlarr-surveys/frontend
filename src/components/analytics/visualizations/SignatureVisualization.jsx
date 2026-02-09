import { Box } from '@mui/material';
import CompletionCard from '../charts/CompletionCard';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformSignatureData } from '~/utils/analytics/dataTransformers';

export default function SignatureVisualization({ question }) {
  const data = transformSignatureData(question);

  const stats = [
    { label: 'Total Expected', value: data.total, color: 'blue' },
    { label: 'Signed', value: data.signed, color: 'green' },
    { label: 'Not Signed', value: data.unsigned, color: 'red' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, color: 'purple' },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CompletionCard
            rate={data.completionRate}
            completed={data.signed}
            total={data.total}
            label="Signed"
            color="auto"
            size="large"
          />
        </Box>
      </Box>
    </ChartContainer>
  );
}
