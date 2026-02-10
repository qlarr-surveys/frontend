export default function CompletionCard({
  rate,
  completed,
  total,
  label = 'Completion Rate',
  color = '#22c55e',
  size = 'medium',
}) {
  const sizeClasses = {
    small: { width: 128, height: 128 },
    medium: { width: 160, height: 160 },
    large: { width: 192, height: 192 },
  };

  const fontSizes = {
    small: { rate: 24, label: 12, count: 12 },
    medium: { rate: 30, label: 14, count: 14 },
    large: { rate: 36, label: 16, count: 16 },
  };

  const strokeWidth = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const safeRate = Number.isFinite(rate) ? rate : 0;
  const strokeDashoffset = circumference * (1 - safeRate / 100);

  const getColor = () => {
    if (rate >= 80) return '#22c55e'; // green
    if (rate >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const finalColor = color === 'auto' ? getColor() : color;
  const containerSize = sizeClasses[size];
  const fonts = fontSizes[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: containerSize.width, height: containerSize.height }}>
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={finalColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: fonts.rate, color: finalColor }}>
            {rate}%
          </span>
          <span style={{ color: '#6b7280', fontSize: fonts.label }}>{label}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, textAlign: 'center', fontSize: fonts.count }}>
        <span style={{ color: '#6b7280' }}>
          {completed} / {total} completed
        </span>
      </div>
    </div>
  );
}

// Stats variant for showing multiple completion metrics
export function CompletionStats({ stats }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 16
    }}>
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 16,
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontSize: 30,
              fontWeight: 'bold',
              color: stat.color || '#3b82f6',
              margin: 0
            }}
          >
            {stat.value}
            {stat.suffix || ''}
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
