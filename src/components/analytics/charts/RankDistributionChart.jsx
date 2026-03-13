import useIsFirstRender from '~/hooks/useIsFirstRender';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getChartColor } from '~/utils/analytics/colors';

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', paddingTop: 12 }}>
      {payload.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#374151' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function RankDistributionChart({ data, ranks, height = 350 }) {
  const isFirstRender = useIsFirstRender();
  const dynamicHeight = Math.max(height, data.length * 50);

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 5, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="option" hide />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 6px rgba(0,0,0,.1)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid #e5e7eb',
                }}>
                  <p style={{ fontWeight: 500, color: '#111827', margin: '0 0 8px 0' }}>{label}</p>
                  {payload.map((entry, i) => (
                    <p key={i} style={{ fontSize: 13, color: entry.color, margin: '0 0 2px 0' }}>
                      {entry.name}: {entry.value}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend content={renderLegend} />
        {ranks.map((rank, i) => (
          <Bar
            key={rank}
            dataKey={rank}
            stackId="a"
            fill={getChartColor(i)}
            isAnimationActive={isFirstRender}
            animationBegin={0}
            animationDuration={800}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
