import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { isGroup } from "~/utils/design/utils";
import { surveySetup, setupOptions } from "~/constants/design";
import { setup } from "~/state/design/designState";
import { getHighlighted } from "~/utils/design/errorDisplay.jsx";

const useErrorDisplay = (code) => {
  const dispatch = useDispatch();

  const isGroupCode = isGroup(code);

  const selectErrorsAndInstructions = useMemo(
    () =>
      createSelector(
        [(state) => state.designState[code] || {}],
        (designState) => {
          const instructionsWithErrors = designState.instructionList?.filter(
            (instruction) => instruction.errors?.length > 0
          );

          const errors = isGroupCode
            ? designState.errors?.filter((e) => e !== "EMPTY_PARENT")
            : designState.errors;

          return {
            errors,
            designErrors: designState.designErrors,
            instructions: instructionsWithErrors?.length
              ? instructionsWithErrors
              : undefined,
          };
        }
      ),
    [code, isGroupCode]
  );

  const { errors, designErrors, instructions } = useSelector(
    selectErrorsAndInstructions
  );

  const hasErrors =
    errors?.length > 0 || designErrors?.length > 0 || instructions?.length > 0;

  const type = useSelector((state) => {
    return code === "Survey"
      ? ""
      : isGroup(code)
      ? state.designState[code].groupType?.toLowerCase() || "group"
      : state.designState[code].type;
  });

  const onErrClick = (instruction) => {
    const highlighted = getHighlighted(instruction.code);
    if (!highlighted) return;
    const isRandomOnSurvey =
      (instruction.code === "random_group" ||
        instruction.code === "priority_groups") &&
      code === "Survey";
    dispatch(
      setup(
        isRandomOnSurvey
          ? { ...surveySetup, highlighted }
          : { code, rules: setupOptions(type), highlighted }
      )
    );
  };

  return { errors, designErrors, instructions, hasErrors, onErrClick };
};

export default useErrorDisplay;
