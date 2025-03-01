import styles from "./IconChoiceItemDesign.module.css";
import { Box, Card, Grid, IconButton, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PhotoCamera from "@mui/icons-material/Photo";
import {
  changeContent,
  changeResources,
  onDrag,
  removeAnswer,
} from "~/state/design/designState";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";
import IconSelector from "~/components/design/IconSelector";
import { rtlLanguage } from "~/utils/common";
import { useDrag, useDrop } from "react-dnd";
import { useService } from "~/hooks/use-service";
import { buildResourceUrl } from "~/networking/common";
import DynamicSvg from "~/components/DynamicSvg";
import { contentEditable, inDesign } from "~/routes";

function IconChoiceItemDesign({
  parentCode,
  index,
  qualifiedCode,
  type,
  columnNumber,
  designMode,
  imageHeight,
  hideText,
  t,
  addAnswer,
}) {
  const designService = useService("design");
  const dispatch = useDispatch();
  const ref = useRef(null);
  const theme = useTheme();
  const [iconSelectoOpen, setIconSelectorOpen] = useState(false);

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const answer = useSelector((state) => {
    return type == "add" ? undefined : state.designState[qualifiedCode];
  });
  const onMainLang = langInfo.lang === langInfo.mainLang;
  const lang = langInfo.lang;

  const svgIconName = answer?.resources?.icon;

  const content = type == "add" ? undefined : answer.content?.["label"]?.[lang];

  const icon = type == "add" ? undefined : answer.icon;

  const isRtl = rtlLanguage.includes(lang);

  const mainContent =
    type == "add" ? undefined : answer.content?.["label"]?.[langInfo.mainLang];

  const onDelete = () => {
    if (window.confirm(`Are you sure?`)) {
      dispatch(removeAnswer(qualifiedCode));
    }
  };
  const dragType = parentCode + "icon-drag";
  const getRowByIndex = (index) => {
    return Math.round(index / columnNumber);
  };
  const getColByIndex = (index) => {
    return index % columnNumber;
  };

  const uploadAsResource = (svgContent) => {
    const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });

    // Create a File object to simulate a file upload
    const svgFile = new File([svgBlob], "file.svg", { type: "image/svg+xml" });

    designService
      .uploadResource(svgFile)
      .then((response) => {
        dispatch(
          changeResources({
            code: qualifiedCode,
            key: "icon",
            value: response.name,
          })
        );
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const colIndex = getColByIndex(index);
  const rowIndex = getRowByIndex(index);

  const [isDragging, drag, preview] = useDrag(
    {
      type: dragType,
      item: {
        index: index,
        colIndex,
        rowIndex,
        draggableId: qualifiedCode,
        parentCode: parentCode,
        type: dragType,
        itemType: dragType,
      },
      collect: (monitor) => monitor.isDragging(),
    },
    [index]
  );

  const [{ handlerId }, drop] = useDrop({
    accept: dragType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current || !monitor.isOver({ shallow: true }) || !item) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      const dragRowIndex = item.rowIndex;
      const hoverRowIndex = rowIndex;

      const dragColIndex = item.colIndex;
      const hoverColIndex = colIndex;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      if (
        dragRowIndex < hoverRowIndex &&
        hoverClientY < hoverMiddleY &&
        dragColIndex < hoverColIndex &&
        hoverClientX < hoverMiddleX
      ) {
        return;
      }
      // Dragging upwards
      if (
        dragRowIndex > hoverRowIndex &&
        hoverClientY > hoverMiddleY &&
        dragColIndex > hoverColIndex &&
        hoverClientX > hoverMiddleX
      ) {
        return;
      }
      {
        dispatch(
          onDrag({
            type: "reorder_answers",
            id: item.draggableId,
            fromIndex: dragIndex,
            toIndex: hoverIndex,
          })
        );

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
        item.rowIndex = hoverRowIndex;
        item.colIndex = hoverColIndex;
      }
    },
  });

  drop(preview(ref));

  return type == "add" ? (
    <Grid item xs={12 / columnNumber} height="100%" key="add">
      <Box
        className={styles.addAnswerButton}
        style={{
          minHeight: "100px",
          borderRadius: "4px",
          backgroundColor: theme.palette.background.default,
          height: "100%",
          width: "100%",
        }}
      >
        <IconButton
          sx={{
            color: theme.textStyles.text.color,
          }}
          className={styles.addAnswerIcon}
          onClick={() => {
            addAnswer();
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Grid>
  ) : (
    <>
      <Grid
        style={{
          opacity: isDragging ? "0.2" : "1",
        }}
        item
        xs={12 / columnNumber}
        key={qualifiedCode}
      >
        <div ref={ref} data-handler-id={handlerId}>
          {inDesign(designMode) && (
            <div className={styles.buttonContainers}>
              <IconButton
                sx={{ color: theme.textStyles.text.color }}
                className={styles.imageIconButton}
                onClick={() => {
                  onDelete();
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
              <IconButton
                sx={{ color: theme.textStyles.text.color }}
                component="label"
                className={styles.imageIconButton}
                onClick={() => setIconSelectorOpen(true)}
              >
                <PhotoCamera />
              </IconButton>
              <IconButton
                sx={{ color: theme.textStyles.text.color }}
                ref={drag}
                className={styles.imageIconButton}
              >
                <DragIndicatorIcon />
              </IconButton>
            </div>
          )}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <DynamicSvg
              theme={theme}
              imageHeight={imageHeight + "px"}
              svgUrl={svgIconName ? buildResourceUrl(svgIconName) : undefined}
            />
          </div>
          {!hideText && (
            <TextField
              dir={isRtl ? "rtl" : "ltr"}
              variant="standard"
              disabled={!contentEditable(designMode)}
              value={content || ""}
              onChange={(e) =>
                dispatch(
                  changeContent({
                    code: qualifiedCode,
                    key: "label",
                    lang: lang,
                    value: e.target.value,
                  })
                )
              }
              placeholder={
                onMainLang
                  ? t("content_editor_placeholder_option")
                  : mainContent || t("content_editor_placeholder_option")
              }
              inputProps={{ style: { textAlign: "center" } }}
              InputProps={{
                sx: {
                  fontFamily: theme.textStyles.text.font,
                  color: theme.textStyles.text.color,
                  fontSize: theme.textStyles.text.size,
                },
              }}
            />
          )}
        </div>
      </Grid>
      {iconSelectoOpen && (
        <IconSelector
          currentIcon=""
          onIconSelected={(icon) => {
            if (icon) {
              uploadAsResource(icon);
            }

            setIconSelectorOpen(false);
          }}
        />
      )}
    </>
  );
}

export default IconChoiceItemDesign;
