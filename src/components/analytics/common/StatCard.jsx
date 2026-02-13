import { Box, Typography } from '@mui/material';

export default function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  description = '',
  size = 'medium',
}) {
  const fontSizes = {
    small: { value: 20, label: 11 },
    medium: { value: 24, label: 13 },
    large: { value: 30, label: 15 },
  };

  const padding = {
    small: 1.5,
    medium: 2,
    large: 3,
  };

  return (
    <Box
      sx={{
        p: padding[size],
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: fontSizes[size].label,
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          fontSize: fontSizes[size].value,
        }}
      >
        {prefix}
        {value}
        {suffix}
      </Typography>
      {description && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

// Stats row component for displaying multiple stats
export function StatsRow({ stats, columns = 4 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
      }}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </Box>
  );
}
