import { Box, Typography, Grid } from '@mui/material';
import PieDonutChart from '../charts/PieDonutChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import DataTable from '../common/DataTable';
import { transformEmailData } from '~/utils/analytics/dataTransformers';

export default function EmailVisualization({ question }) {
  const data = transformEmailData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total, color: 'blue' },
    { label: 'Answered', value: data.answered, description: `${data.skipped} skipped`, color: 'green' },
    { label: 'Unique Domains', value: data.uniqueDomains, color: 'purple' },
    { label: 'Invalid Emails', value: data.invalidCount, color: 'red' },
    {
      label: 'Top Domain',
      value: data.domainData[0]?.name || '-',
      description: `${data.domainData[0]?.count || 0} emails`,
      color: 'gray',
    },
  ];

  // Email list table
  const emailColumns = [
    { key: 'index', label: '#', sortable: true, align: 'right' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'domain', label: 'Domain', sortable: true },
  ];

  const highlightDuplicate = (row) => row.isDuplicate;

  // Domain table
  const domainColumns = [
    { key: 'domain', label: 'Domain', sortable: true },
    { key: 'count', label: 'Count', sortable: true, align: 'right' },
    { key: 'percentage', label: 'Percentage', sortable: true, align: 'right' },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={5} />

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

        {/* All Emails Table */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            All Emails
          </Typography>
          {data.duplicateCount > 0 && (
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: 'warning.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.main',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {data.duplicateCount} duplicate email{data.duplicateCount > 1 ? 's' : ''} detected (highlighted in red below)
              </Typography>
            </Box>
          )}
          <DataTable
            data={data.emailList}
            columns={emailColumns}
            searchable={true}
            paginated={true}
            rowsPerPage={20}
            highlightRow={highlightDuplicate}
            emptyMessage="No email data available"
          />
        </Box>

        {/* Domains Table */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>
            Domains
          </Typography>
          <DataTable
            data={data.allDomainData}
            columns={domainColumns}
            searchable={true}
            paginated={true}
            rowsPerPage={20}
            emptyMessage="No domain data available"
          />
        </Box>
      </Box>
    </ChartContainer>
  );
}
