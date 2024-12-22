import React, { useEffect, useMemo, useRef } from "react";
import styles from "./ContentPanel.module.css";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { buildResourceUrl } from "~/networking/common";
import { Box, CardMedia } from "@mui/material";
import ErrorDisplay from "~/components/design/ErrorDisplay";
import GroupDesign from "~/components/Group/GroupDesign";
import { useTranslation } from "react-i18next";
import { GroupDropArea } from "~/components/design/DropArea/DropArea";
import { Virtuoso } from "react-virtuoso";
import { languageSetup, reorderSetup, themeSetup } from "~/constants/design";
import { useDispatch } from "react-redux";
import { setup } from "~/state/design/designState";
import useDragNearViewportEdge from "~/utils/useDragEdgeDetection";
import { DESIGN_SURVEY_MODE } from '~/routes';

function ContentPanel({ onMainLang, designMode }, ref) {
  const { t } = useTranslation(["design", "run"]);
  const theme = useTheme();
  const dispatch = useDispatch();
  const inDesgin = designMode == DESIGN_SURVEY_MODE.DESIGN

  const groups = useSelector((state) => {
    return state.designState["Survey"]?.children || [];
  });

  const headerImage = useSelector((state) => {
    return state.designState["Survey"]?.resources?.headerImage;
  });

  const backgroundImage = useSelector(
    (state) => state.designState["Survey"]?.resources?.backgroundImage
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

  const showTheme = () => {
    dispatch(setup(themeSetup));
  };
  const showTranslation = () => {
    dispatch(setup(languageSetup));
  };
  const reOrder = () => {
    dispatch(setup(reorderSetup));
  };

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

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${buildResourceUrl(backgroundImage)})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        // backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }
    : {};

  return (
    <Box
      ref={ref}
      className={`content-panel ${styles.contentPanel}`}
      sx={{ backgroundColor: "background.default", color: "text.primary" }}
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
          style={backgroundStyle}
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
