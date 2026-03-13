const tooltipContainerStyle = {
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px rgba(0,0,0,.1)',
  borderRadius: 8,
  padding: 12,
  border: '1px solid #e5e7eb',
};

const titleStyle = { fontWeight: 500, color: '#111827', margin: '0 0 4px 0' };
const detailStyle = { fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' };
const detailStyleLast = { fontSize: 14, color: '#6b7280', margin: 0 };

export default function ChartTooltip({ active, payload, renderContent }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={tooltipContainerStyle}>
      {renderContent(data)}
    </div>
  );
}

export const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', paddingTop: 22 }}>
      {payload.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#374151' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export { titleStyle, detailStyle, detailStyleLast };
