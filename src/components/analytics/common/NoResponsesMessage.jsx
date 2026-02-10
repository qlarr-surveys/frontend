import { Box, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function NoResponsesMessage({
  message = 'No responses yet',
  description = 'Data will appear here once responses are collected.',
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
      }}
    >
      <BarChartIcon
        sx={{
          fontSize: 48,
          color: 'text.disabled',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          mb: 0.5,
        }}
      >
        {message}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'text.disabled' }}
      >
        {description}
      </Typography>
    </Box>
  );
}
