import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
          Count: <span style={{ fontWeight: 500 }}>{data.value}</span>
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Percentage: <span style={{ fontWeight: 500 }}>{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PieDonutChart({
  data,
  donut = false,
  showLabels = true,
  showLegend = true,
  height = 300,
  innerRadius = 0,
  outerRadius = 100,
}) {
  const actualInnerRadius = donut ? outerRadius * 0.6 : innerRadius;

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
            wrapperStyle={{ paddingTop: 20 }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
