import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DATE_FORMATS } from '../../config/constants';
import styles from '../../QlarrLogicBuilder.module.css';

export function DateInput({ value, onChange, t }) {
  const dateValue = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        className={styles.valueInput}
        label={t('logic_builder.value')}
        value={dateValue}
        onChange={(newValue) => {
          onChange(newValue ? newValue.format(DATE_FORMATS.DATE_VALUE) : '');
        }}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
          },
        }}
        format={DATE_FORMATS.DATE_DISPLAY}
      />
    </LocalizationProvider>
  );
}

DateInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
