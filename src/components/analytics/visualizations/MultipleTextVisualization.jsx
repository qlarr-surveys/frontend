import { Box } from '@mui/material';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import DataTable from '../common/DataTable';
import NoResponsesMessage from '../common/NoResponsesMessage';
import { transformMultipleTextData } from '~/utils/analytics/dataTransformers';

export default function MultipleTextVisualization({ question }) {
  const { fields = [], responses = [] } = question;

  if (responses.length === 0) {
    return <NoResponsesMessage />;
  }

  const data = transformMultipleTextData(question);

  const avgCompletion = data.fieldStats.length > 0
    ? Math.round(data.fieldStats.reduce((sum, f) => sum + f.completionRate, 0) / data.fieldStats.length)
    : 0;

  const stats = [
    ...buildBaseStats(data),
    { label: 'Fields', value: fields.length },
    { label: 'Avg Completion', value: `${avgCompletion}%` },
  ];

  const columns = fields.map((field) => ({
    key: field,
    label: field,
    sortable: true,
  }));

  const tableData = responses.map((r) => {
    const row = {};
    fields.forEach((field) => {
      row[field] = r[field] || '-';
    });
    return row;
  });

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={4} />
        <DataTable
          data={tableData}
          columns={columns}
          searchable
          paginated
          rowsPerPage={10}
          emptyMessage="No responses yet"
        />
      </Box>
    </ChartContainer>
  );
}
