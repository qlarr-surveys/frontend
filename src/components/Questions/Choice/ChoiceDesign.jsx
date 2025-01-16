import React from "react";
import styles from "./ChoiceDesign.module.css";
import { Button } from "@mui/material";
import ChoiceItemDesign from "~/components/Questions/Choice/ChoiceItemDesign";

import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { inDesign } from "~/routes";

function ChoiceQuestion(props) {
  const theme = useTheme();
  const t = props.t;

  const children = useSelector((state) => {
    return state.designState[props.code].children;
  });

  const questionType = useSelector((state) => {
    return state.designState[props.code].type;
  });

  const isOther =
    (questionType == "mcq" || questionType == "scq") &&
    (!children || !children.some((el) => el.code === "Aother"));

  return (
    <div className={styles.questionItem}>
      <div className={styles.choicesContainer}>
        {children &&
          children.length > 0 &&
          children.map((item, index) => (
            <ChoiceItemDesign
              designMode={props.designMode}
              code={item.code}
              t={props.t}
              label={item.code}
              key={item.code}
              qualifiedCode={item.qualifiedCode}
              index={index}
              type={props.type}
              droppableId={`option-${props.code}`}
            />
          ))}
      </div>
      {inDesign(props.designMode) && (
        <div className={styles.answerAdd}>
          <Button
            size="small"
            style={{
              fontFamily: theme.textStyles.text.font,
              fontSize: theme.textStyles.text.size,
              color: theme.textStyles.question.color,
            }}
            onClick={() => props.addNewAnswer(props.code, questionType)}
          >
            {t("add_option")}
          </Button>
          {isOther && (
            <>
              <span
                style={{
                  color: theme.textStyles.question.color,
                }}
              >
                {t("or")}
              </span>
              <Button
                style={{
                  fontFamily: theme.textStyles.text.font,
                  fontSize: theme.textStyles.text.size,
                  color: theme.textStyles.question.color,
                }}
                size="small"
                className={styles.answerIcon}
                onClick={() =>
                  props.addNewAnswer(props.code, questionType, "other")
                }
              >
                {t("add_other")}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(ChoiceQuestion);
