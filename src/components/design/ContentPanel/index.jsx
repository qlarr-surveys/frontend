import React, { useEffect, useMemo, useRef } from "react";
import styles from "./ContentPanel.module.css";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { Box, css } from "@mui/material";
import GroupDesign from "~/components/Group/GroupDesign";
import { useTranslation } from "react-i18next";
import { GroupDropArea } from "~/components/design/DropArea/DropArea";
import { Virtuoso } from "react-virtuoso";
import useDragNearViewportEdge from "~/utils/useDragEdgeDetection";
import { resetSetup } from "~/state/design/designState";
import { DESIGN_SURVEY_MODE } from "~/routes";

function ContentPanel({ designMode }, ref) {
  const { t } = useTranslation(["design", "run"]);
  const theme = useTheme();

  const groups = useSelector((state) => {
    return state.designState["Survey"]?.children || [];
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
                  <GroupDesign
                    t={t}
                    key={item.group.code}
                    designMode={designMode}
                    code={item.group.code}
                    index={item.index}
                    lastAddedComponent={lastAddedComponent}
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
  GROUP: "GROUP",
  DROP_AREA: "DROP_AREA",
  FOOTER: "FOOTER",
};
