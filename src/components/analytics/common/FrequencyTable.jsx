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

export default function FrequencyTable({
  data,
  valueLabel = 'Value',
  countLabel = 'Count',
  emptyMessage = 'No data available',
  paginated = true,
  rowsPerPage = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = data?.length ? Math.ceil(data.length / rowsPerPage) : 0;
  const safePage = Math.min(currentPage, totalPages || 1);

  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!paginated) return data;
    const start = (safePage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, safePage, rowsPerPage, paginated]);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startRow = (safePage - 1) * rowsPerPage + 1;
  const endRow = Math.min(safePage * rowsPerPage, data.length);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                {valueLabel}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                {countLabel}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                %
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {item.value || item.text || item.name}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {item.count || item.value}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {item.percentage}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {paginated && totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {startRow}-{endRow} of {data.length} rows
          </Typography>
          <Pagination
            count={totalPages}
            page={safePage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
