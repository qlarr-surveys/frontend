import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import styles from '../../QlarrLogicBuilder.module.css';

export function TextInput({ value, onChange, t }) {
  return (
    <TextField
      className={styles.valueInput}
      label={t('logic_builder.value')}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      variant="outlined"
    />
  );
}

TextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
