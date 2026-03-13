import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import HeatmapChart from '../charts/HeatmapChart';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { useWorkerTransform } from '~/hooks/useWorkerTransform';

export default function MatrixMCQVisualization({ question }) {
  const { data, loading } = useWorkerTransform('transformMatrixMCQData', question);
  const { t } = useTranslation(NAMESPACES.MANAGE);
  if (loading || !data) return null;

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.stat_rows'), value: data.rows.length },
    { label: t('analytics.stat_avg_selections'), value: data.avgSelections },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={3} />
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
