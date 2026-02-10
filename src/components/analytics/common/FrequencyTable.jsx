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
} from '@mui/material';

export default function FrequencyTable({ data, valueLabel = 'Value', countLabel = 'Count', emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
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
          {data.map((item, index) => (
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
  );
}
