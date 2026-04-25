import { useDispatch, useSelector } from "react-redux";
import { updateInstruction } from "~/state/design/designState";

export function useOrderInstructions(code) {
  const dispatch = useDispatch();

  const orderInstruction = useSelector((state) => {
    const instructionList = state.designState[code]?.instructionList || [];
    return instructionList.find(
      (instruction) => instruction.code === "order" && instruction.returnType === "string"
    );
  });

  const isActive = orderInstruction?.isActive === true;

  const onToggle = (checked) => {
    dispatch(
      updateInstruction({
        code,
        instruction: {
          code: "order",
          returnType: "string",
          isActive: checked,
          text: checked ? (orderInstruction?.text || "") : "",
        },
      })
    );
  };

  const onTextChange = (newText) => {
    dispatch(
      updateInstruction({
        code,
        instruction: {
          ...orderInstruction,
          text: newText,
          isActive: true,
        },
      })
    );
  };

  return {
    isActive,
    orderInstruction,
    errors: orderInstruction?.errors || [],
    onToggle,
    onTextChange,
  };
}
