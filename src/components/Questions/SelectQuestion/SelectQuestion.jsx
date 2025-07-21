import { useSelector, useDispatch } from "react-redux";
import { RHFSelect } from "~/components/hook-form";
import { valueChange } from "~/state/runState";
import { shallowEqual } from "react-redux";
import { useTheme } from '@emotion/react';
import Content from '~/components/run/Content';

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
    console.log(event.target.name, event.target.value);
    dispatch(
      valueChange({
        componentCode: component.qualifiedCode,
        value: event.target.value,
      })
    );
  };
  return (
    <RHFSelect
      sx={{ width: "50%" }}
      name={component.qualifiedCode}
      value={state.value}
      onChange={handleChange}
    >
      {component.answers.map((option) => {
        return (
          <option key={option.code} value={option.code}>
            <Content
                elementCode={option.code}
                fontFamily={theme.textStyles.text.font}
                color={theme.textStyles.text.color}
                fontSize={theme.textStyles.text.size}
                name="label"
                lang={lang}
                content={option.content?.label}
              />
          </option>
        );
      })}
    </RHFSelect>
  );
}

export default SelectQuestion;
