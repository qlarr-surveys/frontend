import { useDispatch, useSelector } from "react-redux";
import { updateInstruction } from "~/state/design/designState";

export function useOrderInstructions(code) {
  const dispatch = useDispatch();

  const orderInstruction = useSelector((state) => {
    const instructionList = state.designState[code]?.instructionList || [];
    return instructionList.find(
      (instruction) => instruction.code === "order" && instruction.returnType === "int"
    );
  });

  const isActive = orderInstruction?.isActive === true;

  const onToggle = (checked) => {
    if (!orderInstruction) return;
    dispatch(
      updateInstruction({
        code,
        instruction: { ...orderInstruction, isActive: checked },
      })
    );
  };

  const onTextChange = (newText) => {
    if (!orderInstruction) return;
    dispatch(
      updateInstruction({
        code,
        instruction: { ...orderInstruction, text: newText, isActive: true },
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
