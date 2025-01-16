import React, { useCallback } from "react";
import styles from "./GroupDesign.module.css";
import ContentEditor from "~/components/design/ContentEditor";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ErrorDisplay from "~/components/design/ErrorDisplay";
import { useSelector } from "react-redux";
import ActionToolbar from "../design/ActionToolbar";
import { useDispatch } from "react-redux";
import { deleteGroup } from "~/state/design/designState";
import { hasMajorSetup } from "~/constants/design";
import { DESIGN_SURVEY_MODE } from '~/routes';

function GroupHeader({ t, code, children, designMode }) {
  console.debug("Group Header: " + code);

  const dispatch = useDispatch();
  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const onMainLang = langInfo.onMainLang;

  const group = useSelector((state) => {
    return state.designState[code];
  });

  const theme = useTheme();

  const inDesgin = designMode == DESIGN_SURVEY_MODE.DESIGN

  const onDelete = useCallback(() => dispatch(deleteGroup(code)), [code]);

  return (
    <Box className={styles.headerContent}>
      <Box className={styles.groupHeader} data-code={code}>
        <Box className={styles.contentContainer}>
          {inDesgin && onMainLang && (
            <div className={styles.actionToolbarVisible}>
              <ActionToolbar
                code={code}
                t={t}
                isGroup={true}
                onDelete={onDelete}
                disableDelete={children && children.length > 0}
              />
            </div>
          )}
        </Box>
        <div
          className={styles.textHeader}
          style={{
            fontFamily: theme.textStyles.group.font,
            color: theme.textStyles.group.color,
            fontSize: theme.textStyles.group.size,
          }}
        >
          <ContentEditor
            editable={designMode == DESIGN_SURVEY_MODE.DESIGN || designMode == DESIGN_SURVEY_MODE.LANGUAGES}
            code={code}
            extended={false}
            contentKey="label"
            placeholder={t("content_editor_placeholder_title")}
          />
        </div>
        {group.showDescription && (
          <Box className={styles.textDescription}>
            <ContentEditor
              editable={designMode == DESIGN_SURVEY_MODE.DESIGN || designMode == DESIGN_SURVEY_MODE.LANGUAGES}
              code={code}
              extended={true}
              contentKey="description"
              placeholder={t("content_editor_placeholder_description")}
            />
          </Box>
        )}
        {onMainLang && <ErrorDisplay type="group" code={code} />}
      </Box>
    </Box>
  );
}

export default React.memo(GroupHeader);
