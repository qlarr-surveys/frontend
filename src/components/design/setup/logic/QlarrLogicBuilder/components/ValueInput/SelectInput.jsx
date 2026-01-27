import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Autocomplete, Chip } from '@mui/material';
import styles from '../../QlarrLogicBuilder.module.css';

export function SelectInput({ field, value, onChange, t }) {
  const options = field.options || [];
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter(
    (opt) => opt?.value && selectedValues.includes(opt.value)
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
          size="small"
          variant="outlined"
        />
      )}
      size="small"
    />
  );
}

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
};
