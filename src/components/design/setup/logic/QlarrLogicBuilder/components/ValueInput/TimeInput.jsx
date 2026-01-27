import React from 'react';
import PropTypes from 'prop-types';
import { TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DATE_FORMATS } from '../../config/constants';
import styles from '../../QlarrLogicBuilder.module.css';

export function TimeInput({ value, onChange, t }) {
  const timeValue = value ? dayjs(`2000-01-01 ${value}`) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        className={styles.valueInput}
        label={t('logic_builder.value')}
        value={timeValue}
        onChange={(newValue) => {
          onChange(newValue ? newValue.format(DATE_FORMATS.TIME_VALUE) : '');
        }}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
          },
        }}
        format={DATE_FORMATS.TIME_DISPLAY}
      />
    </LocalizationProvider>
  );
}

TimeInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
