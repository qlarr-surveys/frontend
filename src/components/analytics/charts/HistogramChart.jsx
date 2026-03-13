import useIsFirstRender from '~/hooks/useIsFirstRender';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,.1)',
        borderRadius: 8,
        padding: 12,
        border: '1px solid #e5e7eb',
      }}>
        <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{data.name}</p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{data.count}</p>
      </div>
    );
  }
  return null;
};

export default function HistogramChart({ data, height = 250, color = '#3b82f6', xLabel, rotateLabels = false }) {
  const isFirstRender = useIsFirstRender();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: rotateLabels ? 60 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          angle={rotateLabels ? -45 : 0}
          textAnchor={rotateLabels ? 'end' : 'middle'}
          height={rotateLabels ? 80 : 30}
          label={xLabel ? { value: xLabel, position: 'insideBottom', offset: rotateLabels ? -55 : -5, fontSize: 12, fill: '#6b7280' } : undefined}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          fill={color}
          isAnimationActive={isFirstRender}
          animationBegin={0}
          animationDuration={800}
        >
          <LabelList dataKey="count" position="top" fill="#374151" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
