import React from 'react';
import PropTypes from 'prop-types';
import { OPERATORS } from '../../config/operators';
import { FIELD_TYPES, SELECT_FIELD_TYPES } from '../../config/constants';
import { useLogicBuilder } from '../../LogicBuilderContext';
import { TextInput } from './TextInput';
import { NumberInput } from './NumberInput';
import { SelectInput } from './SelectInput';
import { DateInput } from './DateInput';
import { TimeInput } from './TimeInput';
import { DateTimeInput } from './DateTimeInput';
import { RangeInput } from './RangeInput';

export function ValueInput({ fieldCode, operator, value, onChange }) {
  const { getFieldDefinition, t } = useLogicBuilder();

  const field = fieldCode ? getFieldDefinition(fieldCode) : undefined;
  const operatorDef = operator ? OPERATORS[operator] : undefined;

  // Zero cardinality operators don't need a value input
  if (!operatorDef || operatorDef.cardinality === 0) {
    return null;
  }

  // Range input (for between operator)
  if (operatorDef.cardinality === 2) {
    return (
      <RangeInput
        fieldType={field?.type || FIELD_TYPES.TEXT}
        value={value}
        onChange={onChange}
        t={t}
      />
    );
  }

  // Select/multiselect input
  if (SELECT_FIELD_TYPES.includes(field?.type)) {
    return (
      <SelectInput
        field={field}
        value={value}
        onChange={onChange}
        t={t}
      />
    );
  }

  // Number input
  if (field?.type === FIELD_TYPES.NUMBER) {
    return (
      <NumberInput
        value={value}
        onChange={onChange}
        t={t}
      />
    );
  }

  // Date input
  if (field?.type === FIELD_TYPES.DATE) {
    return (
      <DateInput
        value={value}
        onChange={onChange}
        t={t}
      />
    );
  }

  // Time input
  if (field?.type === FIELD_TYPES.TIME) {
    return (
      <TimeInput
        value={value}
        onChange={onChange}
        t={t}
      />
    );
  }

  // DateTime input
  if (field?.type === FIELD_TYPES.DATETIME) {
    return (
      <DateTimeInput
        value={value}
        onChange={onChange}
        t={t}
      />
    );
  }

  // Default: text input
  return (
    <TextInput
      value={value}
      onChange={onChange}
      t={t}
    />
  );
}

ValueInput.propTypes = {
  fieldCode: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  onChange: PropTypes.func.isRequired,
};
