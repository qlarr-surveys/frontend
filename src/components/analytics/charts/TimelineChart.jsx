import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
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
        <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{label}</p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Count: <span style={{ fontWeight: 500 }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function TimelineChart({
  data,
  type = 'area',
  height = 250,
  color = null,
  showGrid = true,
  xAxisLabel = '',
  yAxisLabel = 'Count',
}) {
  const fillColor = color || getChartColor(0);

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" animationBegin={0} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || fillColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="count"
          stroke={fillColor}
          fill="url(#colorGradient)"
          animationBegin={0}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
