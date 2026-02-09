import { Box, Typography } from '@mui/material';
import HistogramChart from '../charts/HistogramChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformParagraphData } from '~/utils/analytics/dataTransformers';

export default function ParagraphVisualization({ question }) {
  const data = transformParagraphData(question);

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Avg Words', value: data.stats.avgWordCount, color: 'purple' },
    { label: 'Min Words', value: data.stats.min, color: 'gray' },
    { label: 'Max Words', value: data.stats.max, color: 'green' },
  ];

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />

        <HistogramChart
          data={data.lengthHistogram}
          height={300}
          xAxisLabel="Word Count Range"
          showStats={false}
        />

        {/* Sample Responses */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Sample Responses
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 192, overflowY: 'auto' }}>
            {question.responses.slice(0, 5).map((response, i) => (
              <Typography
                key={i}
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  p: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                "{response.length > 150 ? response.slice(0, 150) + '...' : response}"
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </ChartContainer>
  );
}
