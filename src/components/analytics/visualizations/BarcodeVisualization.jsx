import { Box, Typography } from '@mui/material';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import FrequencyTable from '../common/FrequencyTable';
import { transformBarcodeData } from '~/utils/analytics/dataTransformers';

export default function BarcodeVisualization({ question }) {
  const data = transformBarcodeData(question);

  const stats = [
    { label: 'Total Submissions', value: data.total },
    { label: 'Scanned', value: data.answered, description: `${data.skipped} skipped` },
    { label: 'Unique Codes', value: data.uniqueCount },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={3} />
        {data.barData.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Top Scanned Codes
            </Typography>
            <HorizontalBarChart data={data.barData.slice(0, 10)} height={Math.max(250, data.barData.slice(0, 10).length * 40)} />
          </>
        )}
        {data.frequencyData.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              All Scanned Codes
            </Typography>
            <FrequencyTable
              data={data.frequencyData.slice(0, 20)}
              valueLabel="Barcode"
              countLabel="Scans"
            />
          </>
        )}
      </Box>
    </ChartContainer>
  );
}
