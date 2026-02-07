import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { FIELD_TYPES, DATE_FORMATS } from '../../config/constants';
import { getCompactTextFieldProps } from '../../utils/inputProps';
import styles from '../../QlarrLogicBuilder.module.css';

export const RangeInput = React.memo(function RangeInput({ fieldType, value, onChange, t, compact = false }) {
  const [min, max] = value || [null, null];

  const handleMinChange = (newMin) => {
    onChange([newMin, max || '']);
  };

  const handleMaxChange = (newMax) => {
    onChange([min || '', newMax]);
  };


  // Number range
  if (fieldType === FIELD_TYPES.NUMBER) {
    const minProps = getCompactTextFieldProps(compact, t('logic_builder.min'));
    const maxProps = getCompactTextFieldProps(compact, t('logic_builder.max'));
    return (
      <div className={styles.rangeInput}>
        <TextField
          type="number"
          value={min ?? ''}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          {...minProps}
          sx={{ ...minProps.sx, flex: 1, minWidth: 0 }}
        />
        <span className={styles.rangeSeparator}>-</span>
        <TextField
          type="number"
          value={max ?? ''}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          {...maxProps}
          sx={{ ...maxProps.sx, flex: 1, minWidth: 0 }}
        />
      </div>
    );
  }

  // Date range
  if (fieldType === FIELD_TYPES.DATE) {
    const fromProps = getCompactTextFieldProps(compact, t('logic_builder.from'));
    const toProps = getCompactTextFieldProps(compact, t('logic_builder.to'));
    return (
      <div className={styles.rangeInput}>
        <DatePicker
          label={compact ? undefined : t('logic_builder.from')}
          value={min ? dayjs(min) : null}
          onChange={(newValue) => {
            handleMinChange(newValue ? newValue.format(DATE_FORMATS.DATE_VALUE) : '');
          }}
          slotProps={{
            textField: {
              ...fromProps,
              sx: { ...fromProps.sx, flex: 1, minWidth: 0 },
            },
          }}
          format={DATE_FORMATS.DATE_DISPLAY}
        />
        <span className={styles.rangeSeparator}>-</span>
        <DatePicker
          label={compact ? undefined : t('logic_builder.to')}
          value={max ? dayjs(max) : null}
          onChange={(newValue) => {
            handleMaxChange(newValue ? newValue.format(DATE_FORMATS.DATE_VALUE) : '');
          }}
          slotProps={{
            textField: {
              ...toProps,
              sx: { ...toProps.sx, flex: 1, minWidth: 0 },
            },
          }}
          format={DATE_FORMATS.DATE_DISPLAY}
        />
      </div>
    );
  }

  // Default: text range
  const minTextProps = getCompactTextFieldProps(compact, t('logic_builder.min'));
  const maxTextProps = getCompactTextFieldProps(compact, t('logic_builder.max'));
  return (
    <div className={styles.rangeInput}>
      <TextField
        value={min ?? ''}
        onChange={(e) => handleMinChange(e.target.value)}
        {...minTextProps}
        sx={{ ...minTextProps.sx, flex: 1, minWidth: 0 }}
      />
      <span className={styles.rangeSeparator}>-</span>
      <TextField
        value={max ?? ''}
        onChange={(e) => handleMaxChange(e.target.value)}
        {...maxTextProps}
        sx={{ ...maxTextProps.sx, flex: 1, minWidth: 0 }}
      />
    </div>
  );
});

RangeInput.propTypes = {
  fieldType: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};
