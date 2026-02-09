import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getChartColor } from '~/utils/analytics/colors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,.1)',
        borderRadius: 8,
        padding: 12,
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 8px 0' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ fontSize: 14, color: entry.color, margin: '0 0 4px 0' }}>
            {entry.name}: <span style={{ fontWeight: 500 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StackedBarChart({
  data,
  keys,
  colors = null,
  height = 300,
  layout = 'horizontal',
  showLegend = true,
  xAxisLabel = '',
  yAxisLabel = '',
}) {
  const isVertical = layout === 'vertical';
  const chartColors = colors || keys.map((_, i) => getChartColor(i));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isVertical ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 30, left: isVertical ? 100 : 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {isVertical ? (
          <>
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey={data[0] && Object.keys(data[0]).find((k) => !keys.includes(k))}
              width={90}
              tick={{ fontSize: 12 }}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={data[0] && Object.keys(data[0]).find((k) => !keys.includes(k))}
              tick={{ fontSize: 12 }}
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {keys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="stack"
            fill={chartColors[index]}
            animationBegin={index * 100}
            animationDuration={800}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
