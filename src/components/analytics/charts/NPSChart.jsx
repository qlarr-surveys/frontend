import { Box, Typography } from '@mui/material';
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
} from 'recharts';
import PieDonutChart from './PieDonutChart';
import NPSBenchmarkScale from './NPSBenchmarkScale';
import CategoryLegend from '../common/CategoryLegend';
import { NPS_COLORS } from '~/utils/analytics/colors';

// Distribution Chart Component (score 0-10 histogram)
function NPSDistributionChart({ data, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="score" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const category =
                parseInt(data.score) <= 6
                  ? 'Detractor'
                  : parseInt(data.score) <= 8
                  ? 'Passive'
                  : 'Promoter';
              return (
                <div style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 6px rgba(0,0,0,.1)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>Score: {data.score}</p>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>Count: {data.count}</p>
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
        <Bar dataKey="count" animationBegin={0} animationDuration={800}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function NPSChart({ score, categoryData, distributionData }) {
  const legendItems = [
    { name: 'Detractors (0-6)', value: categoryData[0]?.value || 0, fill: NPS_COLORS.detractor },
    { name: 'Passives (7-8)', value: categoryData[1]?.value || 0, fill: NPS_COLORS.passive },
    { name: 'Promoters (9-10)', value: categoryData[2]?.value || 0, fill: NPS_COLORS.promoter },
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
            Category Breakdown
          </Typography>
          <PieDonutChart
            data={categoryData}
            donut
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
            Score Distribution
          </Typography>
          <NPSDistributionChart data={distributionData} />
        </Box>
      </Box>
    </Box>
  );
}

export { NPSDistributionChart };
