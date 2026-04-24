import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ContentPanel.module.css";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { Box, css, IconButton, LinearProgress } from "@mui/material";
import addImageIcon from "~/assets/icons/add-image.svg";
import CloseIcon from "@mui/icons-material/Close";
import GroupDesign from "~/components/Group/GroupDesign";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { GroupDropArea } from "~/components/design/DropArea/DropArea";
import { Virtuoso } from "react-virtuoso";
import useDragNearViewportEdge from "~/utils/useDragEdgeDetection";
import { resetSetup, changeResources } from "~/state/design/designState";
import { DESIGN_SURVEY_MODE } from "~/routes";
import { buildResourceUrl } from "~/networking/common";
import { useService } from "~/hooks/use-service";

function ContentPanel({ designMode }, ref) {
  const { i18n } = useTranslation(NAMESPACES.DESIGN_CORE);
  const theme = useTheme();
  const lang = useSelector((state) => state.designState.langInfo?.lang);
  const [langReady, setLangReady] = useState(false);

  useEffect(() => {
    if (lang) {
      setLangReady(false);
      i18n.loadLanguages([lang]).then(() => setLangReady(true));
    }
  }, [lang, i18n]);

  const t = useMemo(
    () => i18n.getFixedT(lang, NAMESPACES.DESIGN_CORE),
    [lang, i18n, langReady]
  );

  const groups = useSelector((state) => {
    return state.designState["Survey"]?.children || [];
  });
  const logoImage = useSelector(
    (state) => state.designState["Survey"]?.resources?.logoImage
  );

  const groupsEmpty = !groups.length;

  const welcomeGroupExists = useMemo(() => {
    let returnResult = false;
    groups?.forEach((group) => {
      if (
        group?.type === "welcome" ||
        group.groupType?.toLowerCase() === "welcome"
      ) {
        returnResult = true;
      }
    });
    return returnResult;
  }, [groups]);

  const items = useMemo(() => {
    const list = [];

    if (!welcomeGroupExists) {
      list.push({ name: ELEMENTS.DROP_AREA, index: 0 });
    }

    let pageNumber = 1;
    // Find the last regular group index (right before the end page)
    let lastRegularIndex = -1;
    for (let i = groups.length - 1; i >= 0; i--) {
      const gt = (groups[i].type || groups[i].groupType || "").toLowerCase();
      if (gt !== "welcome" && gt !== "end") {
        lastRegularIndex = i;
        break;
      }
    }

    for (let i = 0; i < groups.length; i++) {
      const groupType = (groups[i].type || groups[i].groupType || "").toLowerCase();
      let label = null;

      if (groupType === "welcome") {
        label = t("welcome_page_label");
      } else if (groupType === "end") {
        label = t("thank_you_page_label");
      } else {
        label = t("page_label", { number: pageNumber });
        pageNumber++;
      }

      const isLastGroup = i === lastRegularIndex;
      list.push({ name: ELEMENTS.GROUP, group: groups[i], index: i, label, isLastGroup });
      if (groupType !== "end") {
        list.push({ name: ELEMENTS.DROP_AREA, group: groups[i], index: i + 1 });
      }
    }
    list.push({ name: ELEMENTS.FOOTER });
    return list;
  }, [groups, t]);

  const virtuosoRef = useRef(null);
  const virtuosoWrapperRef = useRef(null);
  const { isNearBottom, isNearTop } =
    useDragNearViewportEdge(virtuosoWrapperRef);

  const lastAddedComponent = useSelector(
    (state) => state.designState.lastAddedComponent
  );
  const skipScroll = useSelector((state) => state.designState.skipScroll);
  const dispatch = useDispatch();
  const designService = useService("design");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const startLogoUpload = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    setUploadProgress(0);
    designService
      .uploadResource(file, null, (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      })
      .then((response) => {
        dispatch(
          changeResources({
            code: "Survey",
            key: "logoImage",
            value: response.name,
          })
        );
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setUploadProgress(null);
      });
  };

  const handleLogoFileInput = (e) => {
    const file = e.target.files[0];
    startLogoUpload(file);
    e.target.value = "";
  };

  const handleLogoReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      changeResources({ code: "Survey", key: "logoImage", value: null })
    );
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.types?.includes("Files")) {
      setIsDragOver(true);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) startLogoUpload(file);
  };

  const isDesignMode = designMode === DESIGN_SURVEY_MODE.DESIGN;
  const isUploading = uploadProgress !== null;

  const virtuosoContext = useMemo(
    () => ({
      logoImage,
      isDesignMode,
      isDragOver,
      isUploading,
      uploadProgress,
      handleLogoFileInput,
      handleLogoReset,
      handleDragEnter,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      t,
    }),
    // handlers are stable enough — only re-emit context when visible state changes
    [logoImage, isDesignMode, isDragOver, isUploading, uploadProgress, t]
  );

  const virtuosoComponents = useMemo(() => ({ Header: LogoHeader }), []);

  useEffect(() => {
    let animationFrameId;
    const performScroll = () => {
      if (virtuosoRef.current) {
        if (isNearBottom) {
          virtuosoRef.current.scrollBy({ top: 6, behavior: "auto" });
        } else if (isNearTop) {
          virtuosoRef.current.scrollBy({ top: -6, behavior: "auto" });
        }
        animationFrameId = requestAnimationFrame(performScroll);
      }
    };

    if (isNearTop || isNearBottom) {
      animationFrameId = requestAnimationFrame(performScroll);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isNearTop, isNearBottom]);

  useEffect(() => {
    if (lastAddedComponent && virtuosoRef.current && !skipScroll) {
      const performScroll = () => {
        if (lastAddedComponent.type === "group") {
          // Calculate the exact index of the newly added group
          const groupBaseIndex = lastAddedComponent.index * 2; // Assuming each group has a drop area before and after
          virtuosoRef.current.scrollToIndex({
            index: groupBaseIndex + 1,
            behavior: "smooth",
            align: "start",
          });
        } else if (lastAddedComponent.type === "question") {
          // Calculate the exact index for the newly added question
          const groupBaseIndex = lastAddedComponent.groupIndex * 2; // Groups and their drop areas
          virtuosoRef.current.scrollToIndex({
            index: groupBaseIndex + 2, // Drop area + question offset
            behavior: "smooth",
            align: "end",
          });
        }
      };

      const timeoutId = setTimeout(performScroll, 100); // Ensure DOM is updated before scrolling

      return () => clearTimeout(timeoutId);
    }
  }, [lastAddedComponent]);

  return (
    <Box
      data-tour="content-panel"
      ref={ref}
      className={`content-panel ${styles.contentPanel}`}
      onClick={(event) => {
        if (designMode == DESIGN_SURVEY_MODE.DESIGN) {
          dispatch(resetSetup());
        }
      }}
      css={css`
        font-size: ${theme.textStyles.text.size}px;
        color: ${theme.textStyles.text.color};
        font-family: ${theme.textStyles.text.font};
      `}
      style={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box ref={virtuosoWrapperRef} width="100%" height="100%">
        <Virtuoso
          ref={virtuosoRef}
          data={items}
          components={virtuosoComponents}
          context={virtuosoContext}
          className={styles.virtuosoStyle}
          itemContent={(index, item) => {
            switch (item.name) {
              case ELEMENTS.DROP_AREA:
                return (
                  <GroupDropArea
                    emptySurvey={groupsEmpty}
                    t={t}
                    index={item.index}
                    groupsCount={groups.length}
                  />
                );
              case ELEMENTS.GROUP:
                return (
                  <>
                    <div className={styles.groupLabel} dir="auto">{item.label}</div>
                    <GroupDesign
                      t={t}
                      key={item.group.code}
                      designMode={designMode}
                      code={item.group.code}
                      index={item.index}
                      lastAddedComponent={lastAddedComponent}
                      isLastGroup={item.isLastGroup}
                    />
                  </>
                );
              case ELEMENTS.FOOTER:
                return <div className={styles.footer} />;
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default React.forwardRef(ContentPanel);

const ELEMENTS = {
  GROUP: "GROUP",
  DROP_AREA: "DROP_AREA",
  FOOTER: "FOOTER",
};

function LogoHeader({ context }) {
  const {
    logoImage,
    isDesignMode,
    isDragOver,
    isUploading,
    uploadProgress,
    handleLogoFileInput,
    handleLogoReset,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    t,
  } = context;

  if (logoImage && !isUploading) {
    return (
      <div className={styles.logoHeader}>
        <div className={styles.logoFrame}>
          <img
            className={styles.surveyLogo}
            src={buildResourceUrl(logoImage)}
            alt=""
          />
          <IconButton
            className={styles.logoRemove}
            onClick={handleLogoReset}
            size="small"
            aria-label="remove logo"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    );
  }
  const dropZoneClass = `${styles.logoDropZone}${
    isDragOver ? " " + styles.logoDropZoneDragOver : ""
  }`;
  return (
    <label
      className={dropZoneClass}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className={styles.logoUploading}>
          <span className={styles.logoDropText}>
            {t("uploading_logo")} {uploadProgress}%
          </span>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            className={styles.logoProgressBar}
          />
        </div>
      ) : (
        <>
          <img src={addImageIcon} className={styles.logoDropIcon} alt="" />
          <span className={styles.logoDropText}>
            {isDragOver ? t("drop_logo_here") : t("upload_logo")}
          </span>
          <span className={styles.logoDropHint}>{t("upload_logo_hint")}</span>
        </>
      )}
      <input
        hidden
        accept="image/*"
        type="file"
        onChange={handleLogoFileInput}
      />
    </label>
  );
}
