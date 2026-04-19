import { setupOptions } from "../../constants/design.js";
import { removeInstruction } from "./addInstructions.js";

export function convertTextQuestion(currentQuestion, newType) {
  if (!currentQuestion.validation) return;

  const validRules =
    setupOptions(newType)?.find((s) => s.key === "validation")?.rules || [];

  Object.keys(currentQuestion.validation).forEach((rule) => {
    if (!validRules.includes(rule)) {
      delete currentQuestion.validation[rule];
      removeInstruction(currentQuestion, rule);
    }
  });
}
