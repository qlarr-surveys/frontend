import { getHeatmapColor } from '~/utils/analytics/colors';

export default function HeatmapChart({
  data,
  rows,
  columns,
  rowsWithIcons,
  height = 'auto',
  cellSize = 50,
  showValues = true,
  colorScale = { low: '#dbeafe', high: '#1d4ed8' },
}) {
  // Resolve column key (supports both string and {key, label, iconUrl} objects)
  const colKey = (col) => (typeof col === 'object' ? col.key : col);

  // Resolve row display info from rowsWithIcons (if provided)
  const getRowInfo = (rowKey) => {
    if (!rowsWithIcons) return { label: rowKey, iconUrl: null };
    const found = rowsWithIcons.find((r) => r.key === rowKey);
    return found || { label: rowKey, iconUrl: null };
  };

  // Find max value for color scaling
  const maxValue = Math.max(
    ...data.flatMap((row) => columns.map((col) => row[colKey(col)] || 0))
  );

  const getCellColor = (value) => {
    if (maxValue === 0) return colorScale.low;
    const intensity = value / maxValue;
    return getHeatmapColor(intensity, colorScale.low, colorScale.high);
  };

  const getTextColor = (value) => {
    const intensity = maxValue > 0 ? value / maxValue : 0;
    return intensity > 0.5 ? '#ffffff' : '#1f2937';
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
        <thead>
          <tr>
            <th style={{
              padding: 8,
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
              backgroundColor: '#f9fafb'
            }}></th>
            {columns.map((col, i) => {
              const label = typeof col === 'object' ? col.label : col;
              const iconUrl = typeof col === 'object' ? col.iconUrl : null;
              return (
                <th
                  key={i}
                  style={{
                    padding: 8,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    minWidth: cellSize
                  }}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={label}
                      title={label}
                      style={{ width: 40, height: 40, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                  ) : (
                    label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((rowData, rowIndex) => (
            <tr key={rowIndex}>
              <td style={{
                padding: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                backgroundColor: '#f9fafb',
                whiteSpace: 'nowrap'
              }}>
                {(() => {
                  const rowInfo = getRowInfo(rowData.row);
                  return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {rowInfo.iconUrl ? (
                        <img
                          src={rowInfo.iconUrl}
                          alt={rowInfo.label}
                          title={rowInfo.label}
                          style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
                        />
                      ) : (
                        rowInfo.label
                      )}
                    </span>
                  );
                })()}
              </td>
              {columns.map((col, colIndex) => {
                const value = rowData[colKey(col)] || 0;
                return (
                  <td
                    key={colIndex}
                    style={{
                      padding: 0,
                      textAlign: 'center',
                      backgroundColor: getCellColor(value),
                      width: cellSize,
                      height: cellSize,
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {showValues && (
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: getTextColor(value)
                        }}
                      >
                        {value}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Color Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 8
      }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Low</span>
        <div
          style={{
            width: 96,
            height: 12,
            borderRadius: 4,
            background: `linear-gradient(to right, ${colorScale.low}, ${colorScale.high})`
          }}
        />
        <span style={{ fontSize: 12, color: '#6b7280' }}>High</span>
      </div>
    </div>
  );
}
