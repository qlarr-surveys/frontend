import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TextField, Autocomplete, Chip, Select, MenuItem, FormControl, Input, Checkbox, ListItemText } from '@mui/material';
import styles from '../../QlarrLogicBuilder.module.css';

export const SelectInput = React.memo(function SelectInput({ field, value, onChange, t, compact = false }) {
  const options = field.options || [];
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  // Compact mode: use Select with filled variant
  if (compact) {
    return (
      <FormControl fullWidth size="small" variant="filled">
        <Select
          variant="filled"
          multiple
          value={selectedValues}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <span style={{ color: '#999' }}>{t('logic_builder.value', 'Value')}</span>;
            }
            const labels = selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return opt ? opt.label : val;
            });
            return <span>{labels.join(', ')}</span>;
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} dense>
              <Checkbox size="small" checked={selectedValues.includes(opt.value)} sx={{ p: 0.5, mr: 1 }} />
              <ListItemText primary={opt.label} primaryTypographyProps={{ fontSize: 14 }} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Full mode: use Autocomplete with chips
  const selectedOptions = useMemo(
    () => options.filter((opt) => opt?.value && selectedValues.includes(opt.value)),
    [options, selectedValues]
  );

  return (
    <Autocomplete
      className={styles.valueInput}
      multiple
      options={options}
      value={selectedOptions}
      onChange={(_event, newValue) => {
        onChange(newValue.map((opt) => opt.value));
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              label={option.label}
              size="small"
              {...tagProps}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('logic_builder.value')}
          placeholder={selectedOptions.length === 0 ? t('logic_builder.value') : undefined}
          size="small"
          variant="filled"
        />
      )}
      size="small"
      fullWidth
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison - compare field by code and options length
  const fieldEqual = prevProps.field?.code === nextProps.field?.code &&
    prevProps.field?.options?.length === nextProps.field?.options?.length;
  const valueEqual = Array.isArray(prevProps.value) && Array.isArray(nextProps.value)
    ? prevProps.value.length === nextProps.value.length &&
      prevProps.value.every((v, i) => v === nextProps.value[i])
    : prevProps.value === nextProps.value;
  return fieldEqual && valueEqual && prevProps.compact === nextProps.compact;
});

SelectInput.propTypes = {
  field: PropTypes.shape({
    code: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};
