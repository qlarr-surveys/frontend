import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import styles from '../../QlarrLogicBuilder.module.css';
import { getCompactTextFieldProps } from '../../utils/inputProps';

export const TextInput = React.memo(function TextInput({ value, onChange, t, compact = false }) {
  const textFieldProps = getCompactTextFieldProps(compact, t('logic_builder.value'));

  return (
    <TextField
      className={compact ? undefined : styles.valueInput}
      {...textFieldProps}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

TextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};
