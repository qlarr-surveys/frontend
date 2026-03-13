import { useMemo } from 'react';
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
import { getChartColor } from '~/utils/analytics/colors';

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

export default function RankingChart({
  data,
  height = 300,
  showFirstLast = true,
}) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const isFirstRender = useIsFirstRender();
  // Sort by average rank (lower is better)
  const sortedData = useMemo(() => [...data].sort((a, b) => a.averageRank - b.averageRank), [data]);

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
            {t('analytics.average_rank_label', { rank: data.averageRank })}
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>
            {t('analytics.first_place_label', { count: data.firstPlace })}
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {t('analytics.last_place_label', { count: data.lastPlace })}
          </p>
        </div>
      );
    }
    return null;
  };

  const legendPayload = useMemo(() => sortedData.map((entry, index) => ({
    value: entry.name,
    type: 'square',
    color: getChartColor(index),
  })), [sortedData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Average Rank Bar Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 5, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            domain={[1, sortedData.length]}
            tick={{ fontSize: 12 }}
            label={{ value: t('analytics.average_rank_axis'), position: 'bottom', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} payload={legendPayload} />
          <Bar
            dataKey="averageRank"
            isAnimationActive={isFirstRender}
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
            <h4 style={{ fontSize: 14, fontWeight: 500, color: '#166534', marginBottom: 8 }}>{t('analytics.most_first_place_votes')}</h4>
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
            <h4 style={{ fontSize: 14, fontWeight: 500, color: '#991b1b', marginBottom: 8 }}>{t('analytics.most_last_place_votes')}</h4>
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
