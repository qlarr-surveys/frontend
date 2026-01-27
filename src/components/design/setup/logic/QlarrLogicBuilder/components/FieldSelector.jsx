import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField, Typography, Box } from '@mui/material';
import { useLogicBuilder } from '../LogicBuilderContext';
import styles from '../QlarrLogicBuilder.module.css';

export function FieldSelector({ value, onChange }) {
  const { fields, t } = useLogicBuilder();

  const selectedField = value
    ? fields.find((f) => f.code === value) || null
    : null;

  const handleChange = (_event, newValue) => {
    if (newValue) {
      onChange(newValue.code);
    }
  };

  return (
    <Autocomplete
      className={styles.fieldSelector}
      options={fields}
      value={selectedField}
      onChange={handleChange}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      groupBy={(option) => option.group || ''}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t('logic_builder.select_field')}
          size="small"
          variant="outlined"
        />
      )}
      renderGroup={(params) => (
        <li key={params.key}>
          <Typography
            variant="overline"
            sx={{
              px: 2,
              py: 0.5,
              display: 'block',
              color: 'text.secondary',
              backgroundColor: 'grey.50',
              fontWeight: 600,
            }}
          >
            {params.group}
          </Typography>
          <Box component="ul" sx={{ p: 0 }}>
            {params.children}
          </Box>
        </li>
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps}>
            {option.label}
          </li>
        );
      }}
      size="small"
      disableClearable={false}
      openOnFocus
    />
  );
}

FieldSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
