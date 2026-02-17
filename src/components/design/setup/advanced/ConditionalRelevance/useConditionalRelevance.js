import { useDispatch, useSelector } from "react-redux";
import { updateInstruction } from "~/state/design/designState";

export function useConditionalRelevance(code) {
  const dispatch = useDispatch();

  const conditionalRelevance = useSelector((state) => {
    const instructionList = state.designState[code]?.instructionList || [];
    return instructionList.find(
      (instruction) => instruction.code === "conditional_relevance"
    );
  });

  const onToggleActive = (isActive) => {
    if (conditionalRelevance) {
      dispatch(
        updateInstruction({
          code,
          instruction: {
            ...conditionalRelevance,
            isActive,
          },
        })
      );
    }
  };

  const onTextChange = (newText) => {
    if (conditionalRelevance) {
      dispatch(
        updateInstruction({
          code,
          instruction: {
            ...conditionalRelevance,
            text: newText,
          },
        })
      );
    }
  };

  const onAdd = () => {
    dispatch(
      updateInstruction({
        code,
        instruction: {
          code: "conditional_relevance",
          isActive: true,
          returnType: "boolean",
          text: "",
        },
      })
    );
  };

  return {
    conditionalRelevance,
    onToggleActive,
    onTextChange,
    onAdd,
  };
}
