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
        <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{data.name}</p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>
          Average Rank: <span style={{ fontWeight: 500 }}>{data.averageRank}</span>
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>
          First Place: <span style={{ fontWeight: 500, color: '#16a34a' }}>{data.firstPlace}</span>
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Last Place: <span style={{ fontWeight: 500, color: '#dc2626' }}>{data.lastPlace}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RankingChart({
  data,
  height = 300,
  showFirstLast = true,
}) {
  // Sort by average rank (lower is better)
  const sortedData = [...data].sort((a, b) => a.averageRank - b.averageRank);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Average Rank Bar Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[1, sortedData.length]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Average Rank (lower is better)', position: 'bottom', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="averageRank"
            animationBegin={0}
            animationDuration={800}
            barSize={25}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getChartColor(index)} />
            ))}
            <LabelList
              dataKey="averageRank"
              position="right"
              fill="#374151"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* First/Last Place Summary */}
      {showFirstLast && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
          <div style={{ backgroundColor: '#f0fdf4', borderRadius: 8, padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: '#166534', marginBottom: 8 }}>Most First Place Votes</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sortedData
                .sort((a, b) => b.firstPlace - a.firstPlace)
                .slice(0, 3)
                .map((item, i) => (
                  <li key={i} style={{ fontSize: 14, color: '#15803d', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 500 }}>{item.firstPlace}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div style={{ backgroundColor: '#fef2f2', borderRadius: 8, padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: '#991b1b', marginBottom: 8 }}>Most Last Place Votes</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sortedData
                .sort((a, b) => b.lastPlace - a.lastPlace)
                .slice(0, 3)
                .map((item, i) => (
                  <li key={i} style={{ fontSize: 14, color: '#b91c1c', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 500 }}>{item.lastPlace}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
