import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { FIELD_TYPES, DATE_FORMATS } from '../../config/constants';
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
    return (
      <div className={styles.rangeInput}>
        <TextField
          label={compact ? undefined : t('logic_builder.min')}
          placeholder={compact ? t('logic_builder.min') : undefined}
          type="number"
          value={min ?? ''}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          size="small"
          variant="filled"
          sx={{ width: compact ? 70 : 100 }}
        />
        <span className={styles.rangeSeparator}>-</span>
        <TextField
          label={compact ? undefined : t('logic_builder.max')}
          placeholder={compact ? t('logic_builder.max') : undefined}
          type="number"
          value={max ?? ''}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          size="small"
          variant="filled"
          sx={{ width: compact ? 70 : 100 }}
        />
      </div>
    );
  }

  // Date range
  if (fieldType === FIELD_TYPES.DATE) {
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
              size: 'small',
              variant: variant,
              placeholder: compact ? t('logic_builder.from') : undefined,
              sx: { width: compact ? 120 : 150 },
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
              size: 'small',
              variant: variant,
              placeholder: compact ? t('logic_builder.to') : undefined,
              sx: { width: compact ? 120 : 150 },
            },
          }}
          format={DATE_FORMATS.DATE_DISPLAY}
        />
      </div>
    );
  }

  // Default: text range
  return (
    <div className={styles.rangeInput}>
      <TextField
        label={compact ? undefined : t('logic_builder.min')}
        placeholder={compact ? t('logic_builder.min') : undefined}
        value={min ?? ''}
        onChange={(e) => handleMinChange(e.target.value)}
        size="small"
        variant="filled"
        sx={{ width: compact ? 70 : 100 }}
      />
      <span className={styles.rangeSeparator}>-</span>
      <TextField
        label={compact ? undefined : t('logic_builder.max')}
        placeholder={compact ? t('logic_builder.max') : undefined}
        value={max ?? ''}
        onChange={(e) => handleMaxChange(e.target.value)}
        size="small"
        variant="filled"
        sx={{ width: compact ? 70 : 100 }}
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
