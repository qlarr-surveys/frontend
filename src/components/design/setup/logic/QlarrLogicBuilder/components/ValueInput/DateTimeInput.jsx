import React from 'react';
import PropTypes from 'prop-types';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DATE_FORMATS } from '../../config/constants';
import styles from '../../QlarrLogicBuilder.module.css';

export function DateTimeInput({ value, onChange, t }) {
  const dateTimeValue = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        className={styles.valueInput}
        label={t('logic_builder.value')}
        value={dateTimeValue}
        onChange={(newValue) => {
          onChange(newValue ? newValue.format(DATE_FORMATS.DATETIME_VALUE) : '');
        }}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
          },
        }}
        format={DATE_FORMATS.DATETIME_DISPLAY}
      />
    </LocalizationProvider>
  );
}

DateTimeInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
