import React, { useCallback, useState } from "react";
import styles from "./GroupDesign.module.css";
import ContentEditor from "~/components/design/ContentEditor";
import { Box, Button, css } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ErrorDisplay from "~/components/design/ErrorDisplay";
import { useSelector, useDispatch } from "react-redux";
import ActionToolbar from "../design/ActionToolbar";
import DeleteModal from "~/components/common/DeleteModal";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { deleteGroup, resetSetup } from "~/state/design/designState";
import { DESIGN_SURVEY_MODE } from "~/routes";

function GroupHeader({ t, code, designMode, langInfo }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const dispatch = useDispatch();

  const onMainLang = langInfo.onMainLang;

  const group = useSelector((state) => {
    return state.designState[code];
  });

  const theme = useTheme();

  const inDesign = designMode == DESIGN_SURVEY_MODE.DESIGN;

  const onDelete = useCallback(() => {
    dispatch(resetSetup());
    dispatch(deleteGroup(code));
  }, [dispatch, code]);

  return (
    <Box className={styles.headerContent}>
      <Box className={styles.groupHeader}>
        <Box className={styles.contentContainer}>
          {inDesign && onMainLang && (
            <>
              <div className={styles.actionToolbarVisible}>
                <ActionToolbar code={code} isGroup={true} />
              </div>
              <div className={styles.actionButtons}>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModalOpen(true);
                  }}
                  size="small"
                  color="primary"
                  startIcon={<SurveyIcon name="delete" size=".9em" color="white" />}
                >
                  {t("delete")}
                </Button>
              </div>
            </>
          )}
        </Box>
        <div
          css={css`
            font-size: ${theme.textStyles.group.size}px;
          `}
        >
          <ContentEditor
            editable={
              designMode == DESIGN_SURVEY_MODE.DESIGN ||
              designMode == DESIGN_SURVEY_MODE.LANGUAGES
            }
            code={code}
            extended={false}
            contentKey="label"
            placeholder={t("content_editor_placeholder_title", {
              lng: langInfo.mainLang,
            })}
          />
        </div>
        {group.showDescription && (
          <Box
            css={css`
              font-size: ${theme.textStyles.text.size}px;
            `}
            className={styles.textDescription}
          >
            <ContentEditor
              editable={
                designMode == DESIGN_SURVEY_MODE.DESIGN ||
                designMode == DESIGN_SURVEY_MODE.LANGUAGES
              }
              code={code}
              extended={true}
              contentKey="description"
              placeholder={t("content_editor_placeholder_description", {
                lng: langInfo.mainLang,
              })}
            />
          </Box>
        )}
        {onMainLang && <ErrorDisplay type="group" code={code} />}
      </Box>
      <DeleteModal
        open={deleteModalOpen}
        description={t("delete_page")}
        handleClose={() => setDeleteModalOpen(false)}
        handleDelete={() => {
          setDeleteModalOpen(false);
          onDelete();
        }}
      />
    </Box>
  );
}

export default React.memo(GroupHeader);
