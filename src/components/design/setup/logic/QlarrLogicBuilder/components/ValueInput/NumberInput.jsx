import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import styles from '../../QlarrLogicBuilder.module.css';

export function NumberInput({ value, onChange, t }) {
  return (
    <TextField
      className={styles.valueInput}
      label={t('logic_builder.value')}
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      size="small"
      variant="outlined"
    />
  );
}

NumberInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
