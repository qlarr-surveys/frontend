/**
 * Generates common TextField props for compact/full mode rendering.
 * Used to reduce duplication across ValueInput components.
 *
 * @param {boolean} compact - Whether to render in compact mode
 * @param {string} label - The label text (used as label or placeholder based on compact mode)
 * @returns {Object} Props object to spread onto TextField or slotProps.textField
 */
export function getCompactTextFieldProps(compact, label) {
  return {
    label: compact ? undefined : label,
    placeholder: compact ? label : undefined,
    size: 'small',
    variant: 'filled',
    fullWidth: true,
  };
}
