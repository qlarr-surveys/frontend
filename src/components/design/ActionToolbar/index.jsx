import { IconButton, Tooltip } from "@mui/material";
import styles from "./ActionToolbar.module.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VerifiedIcon from "@mui/icons-material/Verified";
import React, { useState } from "react";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import MoveDownIcon from "@mui/icons-material/MoveDown";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setupOptions } from "~/constants/design";
import { setup } from "~/state/design/designState";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { useTheme } from "@emotion/react";
import DeleteModal from "~/components/common/DeleteModal";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function ActionToolbar({
  code,
  isGroup,
  isHovered,
  isInSetup,
  parentCode,
  disableDelete,
  onDelete,
  onClone,
  t,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const type = useSelector((state) => {
    return isGroup
      ? state.designState[code].groupType?.toLowerCase() || "group"
      : state.designState[code].type;
  });

  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const hasRelevance = useSelector((state) => {
    let instruction = state.designState[code]?.instructionList?.find(
      (el) => el.code == "conditional_relevance"
    );
    return typeof instruction !== "undefined" && !instruction.errors;
  });

  const hasValidation = useSelector((state) => {
    return (
      !isGroup &&
      state.designState[code]?.instructionList?.filter(
        (el) =>
          el.code.startsWith("validation_") &&
          el.code != "validation_enum" &&
          !el.errors
      )?.length > 0
    );
  });

  const setSetup = () => {
    dispatch(setup({ code, rules: setupOptions(type) }));
  };

  const expandRelevance = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "relevance",
        expanded: ["relevance"],
      })
    );
  };

  const expandValidation = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "validation",
        expanded: ["validation"],
      })
    );
  };

  const expandSkipLogic = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "skip_logic",
        expanded: ["skip_logic"],
      })
    );
  };

  const expandParentRandom = () => {
    if (isGroup) {
      dispatch(setup({ ...surveySetup, highlighted: "random" }));
    } else {
      dispatch(
        setup({
          code: parentCode,
          rules: setupOptions("group"),
          highlighted: "random",
          expanded: ["random"],
        })
      );
    }
  };

  const textColor = theme.palette.primary.main;
  const hasSkip = useSelector((state) => {
    let skipInstructions = state.designState[code]?.instructionList?.filter(
      (el) => el.code.startsWith("skip_to")
    );
    return skipInstructions?.filter((el) => !el.errors)?.length >= 1;
  });

  const isRandomized = useSelector((state) => {
    let indexObj = state.designState.componentIndex?.find(
      (el) => el.code == code
    );
    return indexObj && indexObj.minIndex != indexObj.maxIndex;
  });

  const isPrioritised = useSelector((state) => {
    let indexObj = state.designState.componentIndex?.find(
      (el) => el.code == code
    );
    return indexObj?.prioritisedSiblings?.length > 0;
  });

  return (
    <div
      className={styles.actionControl}
      onClick={(e) => {
        if (e.target !== e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {hasRelevance && (
        <CustomTooltip title="Has show/Hide Condition" showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandRelevance()}
          >
            <VisibilityIcon style={{ color: textColor }} />
          </IconButton>
        </CustomTooltip>
      )}
      {hasValidation && (
        <CustomTooltip title="Has Validation" showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandValidation()}
          >
            <VerifiedIcon style={{ color: textColor }} />
          </IconButton>
        </CustomTooltip>
      )}
      {isRandomized && (
        <CustomTooltip
          title="Is part of a valid Random Group (within parent)"
          showIcon={false}
        >
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandParentRandom()}
          >
            <ShuffleIcon style={{ color: textColor }} />
          </IconButton>
        </CustomTooltip>
      )}
      {isPrioritised && (
        <CustomTooltip
          title="Is part of a valid Priority Group (within parent)"
          showIcon={false}
        >
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandParentRandom()}
          >
            <LowPriorityIcon style={{ color: textColor }} />
          </IconButton>
        </CustomTooltip>
      )}
      {hasSkip && (
        <CustomTooltip title="Has active Skip Logic" showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandSkipLogic()}
          >
            <MoveDownIcon style={{ color: textColor }} />
          </IconButton>
        </CustomTooltip>
      )}
      {(isHovered || isInSetup) && (
        <>
          {!isGroup && (
            <IconButton onClick={() => onClone()}>
              <SurveyIcon
                name="duplicate"
                size=".75em"
                color={`${textColor}`}
              />
            </IconButton>
          )}
          {!disableDelete && (
            <IconButton onClick={() => setOpen(true)} disabled={disableDelete}>
              <SurveyIcon name="delete" size=".75em" color={textColor} />
            </IconButton>
          )}
        </>
      )}

      <DeleteModal
        open={open}
        description={t("delete_question")}
        handleClose={handleClose}
        handleDelete={onDelete}
      />
    </div>
  );
}

export default React.memo(ActionToolbar);
