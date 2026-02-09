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
import { NPS_COLORS } from '~/utils/analytics/colors';

// NPS Gauge Component
function NPSGauge({ score, size = 200 }) {
  const radius = size / 2 - 20;
  const circumference = Math.PI * radius;
  const normalizedScore = (score + 100) / 200; // Convert -100 to 100 → 0 to 1
  const strokeDashoffset = circumference * (1 - normalizedScore);

  const getScoreColor = () => {
    if (score >= 50) return NPS_COLORS.promoter;
    if (score >= 0) return '#84cc16'; // lime
    if (score >= -50) return NPS_COLORS.passive;
    return NPS_COLORS.detractor;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size / 2 + 30} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background arc */}
        <path
          d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 36, fontWeight: 'bold', color: getScoreColor() }}>
          {score}
        </span>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>NPS Score</p>
      </div>
    </div>
  );
}

// Category Bar Component
function NPSCategoryBar({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden' }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              width: `${item.percentage}%`,
              backgroundColor: item.fill,
              minWidth: item.percentage > 0 ? '30px' : '0',
              transition: 'all 0.5s'
            }}
          >
            {item.percentage >= 10 && `${item.percentage}%`}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.fill,
                display: 'inline-block'
              }}
            />
            <span style={{ color: '#6b7280' }}>
              {item.name}: {item.value} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Distribution Chart Component
function NPSDistributionChart({ data, height = 200 }) {
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

export default function NPSChart({
  score,
  categoryData,
  distributionData,
  showGauge = true,
  showCategoryBar = true,
  showDistribution = true,
  gaugeSize = 200,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {showGauge && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <NPSGauge score={score} size={gaugeSize} />
        </div>
      )}

      {showCategoryBar && categoryData && (
        <div style={{ padding: '0 16px' }}>
          <NPSCategoryBar data={categoryData} />
        </div>
      )}

      {showDistribution && distributionData && (
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Score Distribution</h4>
          <NPSDistributionChart data={distributionData} />
        </div>
      )}
    </div>
  );
}

export { NPSGauge, NPSCategoryBar, NPSDistributionChart };
