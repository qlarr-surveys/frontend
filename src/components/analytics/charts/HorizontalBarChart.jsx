import React, { useMemo } from 'react';
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
  Cell,
  LabelList,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';

const renderLegend = (props) => {
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

function BarTooltip({ active, payload }) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
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
          {t('analytics.count_label', { count: data.count })}
        </p>
        {data.percentage !== undefined && (
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {t('analytics.percentage_label', { percentage: data.percentage })}
          </p>
        )}
      </div>
    );
  }
  return null;
}

function HorizontalBarChart({
  data,
  dataKey = 'count',
  showGrid = true,
  showValues = true,
  height = 300,
  barSize = 20,
  maxBarSize = 40,
}) {
  const isFirstRender = useIsFirstRender();

  // Calculate dynamic height based on data length
  const dynamicHeight = Math.max(height, data.length * 50);

  // Build legend payload from data entries
  const legendPayload = useMemo(() => data.map((entry) => ({
    value: entry.name,
    type: 'square',
    color: entry.fill,
  })), [data]);

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 50, left: 5, bottom: 20 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} />}
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          hide
        />
        <Tooltip content={<BarTooltip />} />
        <Legend content={renderLegend} payload={legendPayload} />
        <Bar
          dataKey={dataKey}
          barSize={barSize}
          maxBarSize={maxBarSize}
          isAnimationActive={isFirstRender}
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

export default React.memo(HorizontalBarChart);
