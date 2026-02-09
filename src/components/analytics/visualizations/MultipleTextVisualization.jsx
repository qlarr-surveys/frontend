import { Box, Typography, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { transformMultipleTextData } from '~/utils/analytics/dataTransformers';

export default function MultipleTextVisualization({ question }) {
  const data = transformMultipleTextData(question);

  const avgCompletion = Math.round(
    data.fieldStats.reduce((sum, f) => sum + f.completionRate, 0) / data.fieldStats.length
  );

  const stats = [
    { label: 'Total Responses', value: data.total, color: 'blue' },
    { label: 'Fields', value: question.fields.length, color: 'purple' },
    { label: 'Avg Completion', value: `${avgCompletion}%`, color: 'green' },
  ];

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'error';
  };

  return (
    <ChartContainer
      title={question.title}
      subtitle={question.description}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={3} />

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
              Completion Rate by Field
            </Typography>
            <HorizontalBarChart
              data={data.completionData.map((d) => ({ ...d, count: d.rate }))}
              dataKey="count"
              height={200}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
              Avg Length by Field
            </Typography>
            <HorizontalBarChart
              data={data.lengthData.map((d) => ({ ...d, count: d.avgLength }))}
              dataKey="count"
              height={200}
            />
          </Grid>
        </Grid>

        {/* Field Details */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                  Field
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                  Responses
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                  Completion
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                  Avg Length
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.fieldStats.map((field, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {field.field}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'text.secondary' }}>
                    {field.count}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${field.completionRate}%`}
                      color={getCompletionColor(field.completionRate)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'text.secondary' }}>
                    {field.avgLength} chars
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ChartContainer>
  );
}
