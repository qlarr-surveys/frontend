import useIsFirstRender from '~/hooks/useIsFirstRender';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import PieDonutChart from './PieDonutChart';
import NPSBenchmarkScale from './NPSBenchmarkScale';
import CategoryLegend from '../common/CategoryLegend';
import { NPS_COLORS } from '~/utils/analytics/colors';

// Distribution Chart Component (score 0-10 histogram)
function NPSDistributionChart({ data, height = 250 }) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const isFirstRender = useIsFirstRender();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="score" tick={{ fontSize: 12 }} />
        <YAxis hide />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const category =
                parseInt(data.score) <= 6
                  ? t('analytics.detractor')
                  : parseInt(data.score) <= 8
                  ? t('analytics.passive')
                  : t('analytics.promoter');
              return (
                <div style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 6px rgba(0,0,0,.1)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{t('analytics.score_label', { score: data.score })}</p>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>{t('analytics.count_label', { count: data.count })}</p>
                  <p style={{ fontSize: 14, color: data.fill, margin: 0 }}>
                    {category}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <ReferenceLine x="6" stroke="#ef4444" strokeDasharray="3 3" />
        <ReferenceLine x="8" stroke="#f59e0b" strokeDasharray="3 3" />
        <Bar dataKey="count" isAnimationActive={isFirstRender} animationBegin={0} animationDuration={800}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <LabelList dataKey="count" position="top" fill="#374151" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function NPSChart({ score, categoryData, distributionData }) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const legendItems = [
    { name: t('analytics.detractors_range'), value: categoryData[0]?.value || 0, fill: NPS_COLORS.detractor },
    { name: t('analytics.passives_range'), value: categoryData[1]?.value || 0, fill: NPS_COLORS.passive },
    { name: t('analytics.promoters_range'), value: categoryData[2]?.value || 0, fill: NPS_COLORS.promoter },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Benchmark Scale */}
      <NPSBenchmarkScale score={score} />

      {/* Two-column: Donut + Distribution */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Category Breakdown (Donut) */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
            {t('analytics.category_breakdown')}
          </Typography>
          <PieDonutChart
            data={categoryData}
            showLegend={false}
            height={250}
          />
          <Box sx={{ mt: 2 }}>
            <CategoryLegend items={legendItems} />
          </Box>
        </Box>

        {/* Score Distribution */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
            {t('analytics.score_distribution')}
          </Typography>
          <NPSDistributionChart data={distributionData} />
        </Box>
      </Box>
    </Box>
  );
}

export { NPSDistributionChart };
