import { useDispatch, useSelector } from "react-redux";
import { updateInstruction } from "~/state/design/designState";

export function useOrderInstructions(code) {
  const dispatch = useDispatch();

  const orderInstruction = useSelector((state) => {
    const instructionList = state.designState[code]?.instructionList || [];
    return instructionList.find((instruction) => instruction.code === "order");
  });

  const onTextChange = (newText) => {
    if (orderInstruction) {
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
    }
  };

  return {
    orderInstruction,
    onTextChange,
  };
}
