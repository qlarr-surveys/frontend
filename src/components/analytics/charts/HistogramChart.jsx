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
import { getChartColor } from '~/utils/analytics/colors';

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
        <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>Range: {data.name}</p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Count: <span style={{ fontWeight: 500 }}>{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function HistogramChart({
  data,
  stats = null,
  height = 300,
  showStats = true,
  color = null,
  xAxisLabel = '',
  yAxisLabel = 'Count',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
            height={60}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 0 } : undefined}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {stats?.mean && (
            <ReferenceLine
              x={data.findIndex((d) => {
                const [min, max] = d.name.split('-').map(Number);
                return stats.mean >= min && stats.mean <= max;
              })}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: `Mean: ${stats.mean}`, position: 'top', fill: '#ef4444', fontSize: 12 }}
            />
          )}
          <Bar
            dataKey="count"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color || entry.fill || getChartColor(0)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Statistics Summary */}
      {showStats && stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 16,
          padding: 16,
          backgroundColor: '#f9fafb',
          borderRadius: 8
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.mean}</p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>Mean</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.median}</p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>Median</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.stdDev}</p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>Std Dev</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', margin: 0 }}>
              {stats.min} - {stats.max}
            </p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>Range</p>
          </div>
        </div>
      )}
    </div>
  );
}
