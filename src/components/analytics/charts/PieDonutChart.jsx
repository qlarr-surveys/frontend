import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useIsFirstRender from '~/hooks/useIsFirstRender';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for tiny slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PieDonutChart({
  data,
  showLabels = true,
  showLegend = true,
  height = 300,
  outerRadius = 100,
}) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const isFirstRender = useIsFirstRender();
  const actualInnerRadius = outerRadius * 0.6;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#fff',
          boxShadow: '0 4px 6px rgba(0,0,0,.1)',
          borderRadius: 8,
          padding: 12,
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{data.name}</p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>
            {t('analytics.count_label', { count: data.value })}
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {t('analytics.percentage_label', { percentage: data.percentage })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomizedLabel : false}
          innerRadius={actualInnerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={isFirstRender}
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 30 }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
