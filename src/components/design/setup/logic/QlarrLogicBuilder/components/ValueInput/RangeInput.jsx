import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { FIELD_TYPES, DATE_FORMATS } from '../../config/constants';
import styles from '../../QlarrLogicBuilder.module.css';

export function RangeInput({ fieldType, value, onChange, t }) {
  const [min, max] = value || [null, null];

  const handleMinChange = (newMin) => {
    onChange([newMin, max || '']);
  };

  const handleMaxChange = (newMax) => {
    onChange([min || '', newMax]);
  };

  // Number range
  if (fieldType === FIELD_TYPES.NUMBER) {
    return (
      <div className={styles.rangeInput}>
        <TextField
          label={t('logic_builder.min')}
          type="number"
          value={min ?? ''}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          size="small"
          variant="outlined"
          sx={{ width: 100 }}
        />
        <span className={styles.rangeSeparator}>-</span>
        <TextField
          label={t('logic_builder.max')}
          type="number"
          value={max ?? ''}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          size="small"
          variant="outlined"
          sx={{ width: 100 }}
        />
      </div>
    );
  }

  // Date range
  if (fieldType === FIELD_TYPES.DATE) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={styles.rangeInput}>
          <DatePicker
            label={t('logic_builder.from')}
            value={min ? dayjs(min) : null}
            onChange={(newValue) => {
              handleMinChange(newValue ? newValue.format(DATE_FORMATS.DATE_VALUE) : '');
            }}
            slotProps={{
              textField: {
                size: 'small',
                variant: 'outlined',
                sx: { width: 150 },
              },
            }}
            format={DATE_FORMATS.DATE_DISPLAY}
          />
          <span className={styles.rangeSeparator}>-</span>
          <DatePicker
            label={t('logic_builder.to')}
            value={max ? dayjs(max) : null}
            onChange={(newValue) => {
              handleMaxChange(newValue ? newValue.format(DATE_FORMATS.DATE_VALUE) : '');
            }}
            slotProps={{
              textField: {
                size: 'small',
                variant: 'outlined',
                sx: { width: 150 },
              },
            }}
            format={DATE_FORMATS.DATE_DISPLAY}
          />
        </div>
      </LocalizationProvider>
    );
  }

  // Default: text range
  return (
    <div className={styles.rangeInput}>
      <TextField
        label={t('logic_builder.min')}
        value={min ?? ''}
        onChange={(e) => handleMinChange(e.target.value)}
        size="small"
        variant="outlined"
        sx={{ width: 100 }}
      />
      <span className={styles.rangeSeparator}>-</span>
      <TextField
        label={t('logic_builder.max')}
        value={max ?? ''}
        onChange={(e) => handleMaxChange(e.target.value)}
        size="small"
        variant="outlined"
        sx={{ width: 100 }}
      />
    </div>
  );
}

RangeInput.propTypes = {
  fieldType: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
