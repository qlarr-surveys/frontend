import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import ValidationItem from "~/components/run/ValidationItem";

function Validation(props) {
  const selectValidation = (state) =>
    (props.component.validation
      ? state.runState.values[props.component.qualifiedCode]
      : {}) || {};

  const captureValidation = createSelector(
    [selectValidation],
    (selectedState) => {
      var obj = {};
      Object.keys(selectedState)
        .filter((e) => e.startsWith("validation_"))
        .forEach((key) => {
          var value = selectedState[key];
          if (value) {
            obj[key] = value;
          }
        });
      return obj;
    },
  );

  const validation = useSelector(captureValidation);

  const messages = () => {
    let array = Object.keys(validation);
    let limit = props.limit ? props.limit : array.length;
    return array.slice(0, limit).map((key, index) => {
      return (
        <ValidationItem
          key={index}
          name={key}
          componentCode={props.component.qualifiedCode}
          content={props.component.content?.[key]}
          validation={props.component.validation[key]}
        />
      );
    });
  };
  return messages();
}

export default Validation;
