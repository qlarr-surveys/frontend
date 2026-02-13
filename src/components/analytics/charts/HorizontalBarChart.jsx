import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
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
          Count: <span style={{ fontWeight: 500 }}>{data.count}</span>
        </p>
        {data.percentage !== undefined && (
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Percentage: <span style={{ fontWeight: 500 }}>{data.percentage}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function HorizontalBarChart({
  data,
  dataKey = 'count',
  showGrid = true,
  showValues = true,
  height = 300,
  barSize = 20,
  maxBarSize = 40,
}) {
  // Calculate dynamic height based on data length
  const dynamicHeight = Math.max(height, data.length * 50);

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 50, left: 100, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} />}
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey={dataKey}
          barSize={barSize}
          maxBarSize={maxBarSize}
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          {showValues && (
            <LabelList
              dataKey={dataKey}
              position="right"
              fill="#374151"
              fontSize={12}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
