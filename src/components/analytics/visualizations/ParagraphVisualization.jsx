import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Pagination,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '~/hooks/useNamespaceLoader';
import ChartContainer from '../common/ChartContainer';
import { StatsRow } from '../common/StatCard';
import { buildBaseStats } from '../common/buildBaseStats';
import { transformParagraphData } from '~/utils/analytics/dataTransformers';

const ROWS_PER_PAGE = 10;

export default function ParagraphVisualization({ question }) {
  const data = useMemo(() => transformParagraphData(question), [question]);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation(NAMESPACES.MANAGE);

  const totalPages = Math.ceil(data.responses.length / ROWS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);

  const displayData = useMemo(() => {
    const start = (safePage - 1) * ROWS_PER_PAGE;
    return data.responses.slice(start, start + ROWS_PER_PAGE);
  }, [data.responses, safePage]);

  const stats = [
    ...buildBaseStats(data, t),
    { label: t('analytics.avg_length'), value: t('analytics.chars', { length: data.avgLength }) },
  ];

  const startRow = (safePage - 1) * ROWS_PER_PAGE + 1;
  const endRow = Math.min(safePage * ROWS_PER_PAGE, data.responses.length);

  return (
    <ChartContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StatsRow stats={stats} columns={3} />
        {data.responses.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body1">{t('analytics.no_responses_available')}</Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary', width: 60 }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                      {t('analytics.col_response')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayData.map((response, index) => (
                    <TableRow key={startRow + index} hover>
                      <TableCell sx={{ color: 'text.secondary', width: 60 }}>
                        {startRow + index}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {response}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('analytics.showing_responses', { start: startRow, end: endRow, total: data.responses.length })}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={safePage}
                  onChange={(e, value) => setCurrentPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ChartContainer>
  );
}
