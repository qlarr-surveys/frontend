import React, { useEffect, useMemo, useRef } from "react";
import styles from "./ContentPanel.module.css";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { buildResourceUrl } from "~/networking/common";
import {
  Backdrop,
  Box,
  CardMedia,
  Chip,
  SpeedDial,
  SpeedDialAction,
} from "@mui/material";
import ErrorDisplay from "~/components/design/ErrorDisplay";
import GroupDesign from "~/components/Group/GroupDesign";
import { useTranslation } from "react-i18next";
import { GroupDropArea } from "~/components/design/DropArea/DropArea";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Virtuoso } from "react-virtuoso";
import TranslateIcon from "@mui/icons-material/Translate";
import { Cancel, Palette } from "@mui/icons-material";
import ReorderIcon from "@mui/icons-material/Reorder";
import { languageSetup, reorderSetup, themeSetup } from "~/constants/design";
import { useDispatch } from "react-redux";
import {
  resetSetup,
  setDesignModeToLang,
  setDesignModeToReorder,
  setDesignModeToTheme,
  setup,
} from "~/state/design/designState";
import useDragNearViewportEdge from "~/utils/useDragEdgeDetection";
import { DESIGN_SURVEY_MODE } from "~/routes";

function ContentPanel({ designMode }, ref) {
  const { t } = useTranslation(["design", "run"]);
  const theme = useTheme();
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const dispatch = useDispatch();
  const inDesgin = designMode == DESIGN_SURVEY_MODE.DESIGN;

  const groups = useSelector((state) => {
    return state.designState["Survey"]?.children || [];
  });

  const toDesign = (() => {
    dispatch(resetSetup())
  });

  const headerImage = useSelector((state) => {
    return state.designState["Survey"]?.resources?.headerImage;
  });

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

    if (headerImage) {
      list.push({ name: ELEMENTS.IMAGE });
    }

    if (!welcomeGroupExists) {
      list.push({ name: ELEMENTS.DROP_AREA, index: 0 });
    }

    for (let i = 0; i < groups.length; i++) {
      list.push({ name: ELEMENTS.GROUP, group: groups[i], index: i });
      if (
        groups[i].type !== "end" &&
        groups[i].groupType?.toLowerCase() !== "end"
      ) {
        list.push({ name: ELEMENTS.DROP_AREA, group: groups[i], index: i + 1 });
      }
    }
    list.push({ name: ELEMENTS.FOOTER });
    return list;
  }, [groups, t, headerImage]);



  const virtuosoRef = useRef(null);
  const virtuosoWrapperRef = useRef(null);
  const { isNearBottom, isNearTop } =
    useDragNearViewportEdge(virtuosoWrapperRef);

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

  return (
    <Box
      ref={ref}
      className={`content-panel ${styles.contentPanel}`}
      sx={{  color: "text.primary" }}
      style={{
        fontFamily: theme.textStyles.text.font,
        color: theme.textStyles.text.color,
        fontSize: theme.textStyles.text.size,
      }}
    >
      <Box ref={virtuosoWrapperRef} width="100%" height="100%">
        <Virtuoso
          ref={virtuosoRef}
          data={items}
          className={styles.virtuosoStyle}
          itemContent={(index, item) => {
            switch (item.name) {
              case ELEMENTS.IMAGE:
                return (
                  <Box className={styles.cardMediaContent}>
                    <CardMedia
                      className={styles.cardImage}
                      component="img"
                      image={buildResourceUrl(headerImage)}
                      height="140"
                    />
                    {inDesgin && <ErrorDisplay code="Survey" />}
                  </Box>
                );

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
                  <GroupDesign
                    t={t}
                    designMode={designMode}
                    code={item.group.code}
                    index={item.index}
                  />
                );
              case ELEMENTS.FOOTER:
                return <div className={styles.footer} />;
            }
          }}
        />
      </Box>
      <DesignChip onCancel={toDesign} designMode={designMode} />
      <DesignOptions
        designMode={designMode}
        optionsOpen={optionsOpen}
        setOptionsOpen={setOptionsOpen}
      />
    </Box>
  );
}

export default React.forwardRef(ContentPanel);

const ELEMENTS = {
  IMAGE: "IMAGE",
  GROUP: "GROUP",
  DROP_AREA: "DROP_AREA",
  FOOTER: "FOOTER",
};

function DesignOptions({ setOptionsOpen, optionsOpen, designMode }) {
  const dispatch = useDispatch();
  const actions = [
    {
      icon: <TranslateIcon />,
      name: "Language",
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToLang());
      },
    },
    {
      icon: <Palette />,
      name: "Theme",
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToTheme());
      },
    },
    {
      icon: <ReorderIcon />,
      name: "Reorder",
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToReorder());
      },
    },
  ];
  return (
    designMode == DESIGN_SURVEY_MODE.DESIGN && (
      <>
        <Backdrop style={{ zIndex: 1 }} open={optionsOpen} />
        <SpeedDial
          open={optionsOpen}
          onClick={() => setOptionsOpen(!optionsOpen)}
          ariaLabel="SpeedDial basic example"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          icon={<MoreHorizIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              onClick={action.onClick}
              key={action.name}
              icon={action.icon}
              tooltipOpen
              tooltipTitle={action.name}
            />
          ))}
        </SpeedDial>
      </>
    )
  );
}

function DesignChip({ designMode, onCancel }) {
  return (
    designMode != DESIGN_SURVEY_MODE.DESIGN && (
      <Chip
        sx={{
          borderRadius: "48px",
          height: "48px",
          fontSize: "24px",
          position: "absolute",
          bottom: "16px",
          padding: "8px",
          right: "16px",
        }}
        label="Back to Design"
        icon={<Cancel />}
        color="primary"
        onClick={onCancel}
      />
    )
  );
}
