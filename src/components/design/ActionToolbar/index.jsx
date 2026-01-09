import { IconButton } from "@mui/material";
import styles from "./ActionToolbar.module.css";
import VerifiedIcon from "@mui/icons-material/Verified";
import React, { useCallback, useState } from "react";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import MoveDownIcon from "@mui/icons-material/MoveDown";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setupOptions } from "~/constants/design";
import { setup, cloneQuestion, deleteQuestion, deleteGroup, resetSetup } from "~/state/design/designState";
import { useTheme } from "@emotion/react";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { RuleOutlined, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import DeleteModal from "~/components/common/DeleteModal";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";

function ActionToolbar({ code, isGroup, parentCode }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation(["design"]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const onDelete = useCallback(() => {
    dispatch(resetSetup());
    if (isGroup) {
      dispatch(deleteGroup(code));
    } else {
      dispatch(deleteQuestion(code));
    }
  }, [dispatch, code, isGroup]);

  const onClone = useCallback(() => {
    dispatch(cloneQuestion(code));
  }, [dispatch, code]);

  const type = useSelector((state) => {
    return isGroup
      ? state.designState[code].groupType?.toLowerCase() || "group"
      : state.designState[code].type;
  });

  const relevanceInstruction = useSelector((state) =>
    state.designState[code]?.instructionList?.find(
      (el) => el.code === "conditional_relevance"
    )
  );

  const hasRelevance = !!relevanceInstruction && !relevanceInstruction.errors;
  const isDisabled = hasRelevance && relevanceInstruction.text === "false";

  const hasValidation = useSelector((state) => {
    return (
      !isGroup &&
      state.designState[code]?.validation &&
      Object.values(state.designState[code].validation).some(
        (el) => el.isActive === true
      )
    );
  });

  const expandRelevance = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "relevance",
      })
    );
  };

  const expandDisabled = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "disabled",
      })
    );
  };

  const expandValidation = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "validation",
      })
    );
  };

  const expandSkipLogic = () => {
    dispatch(
      setup({
        code,
        rules: setupOptions(type),
        highlighted: "skip_logic",
      })
    );
  };

  const expandRandom = (randomRule) => {
    if (isGroup) {
      dispatch(
        setup({
          code,
          rules: setupOptions("group"),
          highlighted: randomRule,
        })
      );
    } else {
      dispatch(
        setup({
          code,
          rules: setupOptions(type),
          highlighted: randomRule,
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

  const randomRule = useSelector((state) => {
    return state.designState[code].randomize_questions
      ? "randomize_questions"
      : state.designState[code].randomize_options
      ? "randomize_options"
      : state.designState[code].randomize_rows
      ? "randomize_rows"
      : state.designState[code].randomize_columns
      ? "randomize_columns"
      : undefined;
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
      {hasRelevance && !isDisabled && (
        <CustomTooltip title={t("tooltips.has_relevance")} showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandRelevance()}
          >
            <RuleOutlined />
          </IconButton>
        </CustomTooltip>
      )}

      {isDisabled && (
        <CustomTooltip title={t("tooltips.is_disabled")} showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandDisabled()}
          >
            <VisibilityOff />
          </IconButton>
        </CustomTooltip>
      )}

      {hasValidation && (
        <CustomTooltip title={t("tooltips.has_validation")} showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandValidation()}
          >
            <VerifiedIcon />
          </IconButton>
        </CustomTooltip>
      )}
      {randomRule && (
        <CustomTooltip title={t("tooltips.is_randomized")} showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandRandom(randomRule)}
          >
            <ShuffleIcon />
          </IconButton>
        </CustomTooltip>
      )}
      {hasSkip && (
        <CustomTooltip title={t("tooltips.has_skip")} showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={() => expandSkipLogic()}
          >
            <MoveDownIcon />
          </IconButton>
        </CustomTooltip>
      )}
      {!isGroup && (
        <CustomTooltip title={t("duplicate")} showIcon={false}>
          <IconButton
            className={styles.statusIcon}
            onClick={(e) => {
              e.stopPropagation();
              onClone();
            }}
          >
            <SurveyIcon name="duplicate" size="1em" color="currentColor" />
          </IconButton>
        </CustomTooltip>
      )}
        <>
          <CustomTooltip title={t("delete")} showIcon={false}>
            <IconButton
              className={styles.statusIcon}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModalOpen(true);
              }}
            >
              <SurveyIcon name="delete" size="1em" color="currentColor" />
            </IconButton>
          </CustomTooltip>
          <DeleteModal
            open={deleteModalOpen}
            description={t(isGroup ? "delete_page" : "delete_question")}
            handleClose={() => setDeleteModalOpen(false)}
            handleDelete={() => {
              setDeleteModalOpen(false);
              onDelete();
            }}
          />
        </>
    </div>
  );
}

export default React.memo(ActionToolbar);
