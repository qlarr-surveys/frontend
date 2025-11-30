import { useSelector, useDispatch } from "react-redux";
import { RHFSelect } from "~/components/hook-form";
import { valueChange } from "~/state/runState";
import { shallowEqual } from "react-redux";
import { useTheme } from "@emotion/react";
import Content from "~/components/run/Content";

function SelectQuestion({ lang, component }) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let questionState = state.runState.values[component.qualifiedCode];
    return {
      value: questionState?.value || "",
    };
  }, shallowEqual);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    dispatch(
      valueChange({
        componentCode: component.qualifiedCode,
        value: event.target.value,
      })
    );
  };

  const visibleAnswers = useSelector(
    (state) =>
      component.answers.filter((ans) => {
        return state.runState.values[ans.qualifiedCode]?.relevance ?? true;
      }),
    shallowEqual
  );

  return (
    <>
      <RHFSelect
        sx={{ width: "50%" }}
        name={component.qualifiedCode}
        value={state.value}
        onChange={handleChange}
      >
        {visibleAnswers.map((option) => {
          return (
            <option key={option.code} value={option.code}>
              <Content
                elementCode={option.code}
                customStyle={`
        font-size: ${theme.textStyles.text.size}px;
        `}
                name="label"
                lang={lang}
                content={option.content?.label}
              />
            </option>
          );
        })}
      </RHFSelect>
    </>
  );
}

export default SelectQuestion;
