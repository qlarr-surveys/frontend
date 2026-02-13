import { Box, Typography } from '@mui/material';

export default function ChartContainer({
  title,
  subtitle,
  children,
  actions = null,
}) {
  return (
    <Box>
      {/* Header */}
      {(title || actions) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
        </Box>
      )}

      {/* Content */}
      <Box>{children}</Box>
    </Box>
  );
}
