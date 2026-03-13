import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import ChartContainer from '../common/ChartContainer';
import FrequencyTable from '../common/FrequencyTable';
import { StatsRow } from '../common/StatCard';
import { useWorkerTransform } from '~/hooks/useWorkerTransform';

export default function FileUploadVisualization({ question }) {
  const { data, loading } = useWorkerTransform('transformFileUploadData', question);
  const { t } = useTranslation(NAMESPACES.MANAGE);

  if (loading || !data) return null;

  const stats = [
    { label: t('analytics.stat_uploaded'), value: data.answered },
  ];

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={1} />
        <FrequencyTable data={data.extensionData} valueLabel={t('analytics.col_extension')} countLabel={t('analytics.col_count')} />
      </Box>
    </ChartContainer>
  );
}
