import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { useWorkerTransform } from '~/hooks/useWorkerTransform';

export default function MatrixSCQVisualization({ question }) {
  const { data, loading } = useWorkerTransform('transformMatrixSCQData', question);
  const { t } = useTranslation(NAMESPACES.MANAGE);
  if (loading || !data) return null;

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.stat_rows'), value: data.rows.length },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Row */}
        <StatsRow stats={stats} columns={3} />

        {/* Heatmap */}
        <HeatmapChart
          data={data.heatmapData}
          rows={data.rows}
          columns={data.columns}
          cellSize={60}
          showValues={true}
        />
      </Box>
    </ChartContainer>
  );
}
