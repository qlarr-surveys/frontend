import styles from "./ImageChoiceItemDesign.module.css";
import btnStyles from "~/components/Questions/shared/choiceItemButtons.module.css";
import { alpha, Box, css, Grid, IconButton, TextField } from "@mui/material";
import { getContrastColor, getMildBorderColor } from "~/components/Questions/utils";
import { placeholderImageUrl } from "~/components/Questions/placeholderImage";
import { useTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import PhotoCamera from "@mui/icons-material/Photo";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  changeContent,
  changeResources,
  onDrag,
  removeAnswer,
  setup,
} from "~/state/design/designState";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { buildResourceUrl } from "~/networking/common";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";
import { rtlLanguage } from "~/utils/common";
import { useDrag, useDrop } from "react-dnd";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import { contentEditable, inDesign } from "~/routes";
import { Build } from "@mui/icons-material";
import { setupOptions } from "~/constants/design";
import ContentEditor from "~/components/design/ContentEditor";
import InlineCodeEditor from "~/components/design/InlineCodeEditor";

function ImageChoiceItemDesign({
  parentCode,
  index,
  qualifiedCode,
  type,
  code,
  columnNumber,
  imageAspectRatio,
  designMode,
  langInfo,
  hideText,
  t,
  addAnswer,
}) {
  const designService = useService("design");
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef();
  const [isUploading, setUploading] = useState(false);

  const answer = useSelector((state) => {
    return type == "add" ? undefined : state.designState[qualifiedCode];
  });
  const onMainLang = langInfo.lang === langInfo.mainLang;
  const lang = langInfo.lang;
  const isRtl = rtlLanguage.includes(lang);

  const content = useSelector((state) => {
    return type == "add"
      ? undefined
      : state.designState[qualifiedCode].content?.[lang]?.["label"];
  });

  const mainContent = useSelector((state) => {
    return type == "add"
      ? undefined
      : state.designState[qualifiedCode].content?.[langInfo.mainLang]?.[
          "label"
        ];
  });

  const onDelete = () => {
    if (window.confirm(t("are_you_sure"))) {
      dispatch(removeAnswer(qualifiedCode));
    }
  };

  const isInSetup = useSelector((state) => {
    return state.designState.setup?.code == qualifiedCode;
  });

  const contrastColor = alpha(theme.palette.primary.main, 0.25);
  const labelColor = theme.contrast?.onDefault || getContrastColor(theme.palette.background.default);
  const addCardBorder = theme.contrast?.mildPaperBorder || getMildBorderColor(getContrastColor(theme.palette.background.paper), 0.4);
  const addIconColor = theme.contrast?.onPaper || getContrastColor(theme.palette.background.paper);

  const backgroundImage = answer?.resources?.image
    ? `url('${buildResourceUrl(answer.resources.image)}')`
    : placeholderImageUrl(theme);

  function handleImageChange(e) {
    e.preventDefault();
    let file = e.target.files[0];
    setUploading(true);
    designService
      .uploadResource(file)
      .then((response) => {
        setUploading(false);
        dispatch(
          changeResources({
            code: qualifiedCode,
            key: "image",
            value: response.name,
          })
        );
      })
      .catch((err) => {
        setUploading(false);
        console.error(err);
      });
  }

  const dragType = parentCode + "image-drag";
  const getRowByIndex = (index) => {
    return Math.round(index / columnNumber);
  };
  const getColByIndex = (index) => {
    return index % columnNumber;
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
    <Grid item xs={12 / columnNumber} key="add">
      <Box
        className={styles.addAnswerButton}
        style={{
          minHeight: "100px",
          width: "100%",
          aspectRatio: imageAspectRatio,
          backgroundColor: theme.palette.background.paper,
          border: `1px dashed ${addCardBorder}`,
          borderRadius: "4px",
        }}
      >
        <IconButton
          className={styles.addAnswerIcon}
          sx={{ color: addIconColor }}
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
        data-code={code}
        position="relative"
        xs={12 / columnNumber}
        key={qualifiedCode}
      >
        {isInSetup && (
          <div
            className={styles.overlay}
            style={{ backgroundColor: contrastColor }}
          />
        )}
        <div
          className={styles.imageContainer}
          style={{
            paddingTop: 100 / imageAspectRatio + "%",
            backgroundImage: backgroundImage,
          }}
          ref={ref}
          data-handler-id={handlerId}
        >
          {inDesign(designMode) && (
            <div className={`${btnStyles.buttonContainers} ${styles.buttonContainersAbsolute}`}>
              <div className={btnStyles.leftZone}>
                <IconButton ref={drag} className={btnStyles.iconButton}>
                  <DragIndicatorIcon color="action" />
                </IconButton>
                <div className={btnStyles.codeWrapper}>
                  <InlineCodeEditor
                    qualifiedCode={qualifiedCode}
                    designMode={designMode}
                    compact
                  />
                </div>
              </div>
              <div className={btnStyles.rightZone}>
                <IconButton
                  className={btnStyles.iconButton}
                  onClick={() => {
                    onDelete();
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
                <IconButton
                  className={btnStyles.iconButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(
                      setup({
                        code: qualifiedCode,
                        rules: setupOptions("options"),
                      })
                    );
                  }}
                >
                  <Build />
                </IconButton>
                <IconButton
                  component="label"
                  className={btnStyles.iconButton}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <PhotoCamera />
                  <input
                    hidden
                    id={`file-input-${qualifiedCode}`}
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                  />
                </IconButton>
              </div>
            </div>
          )}

          {isUploading && (
            <div className={styles.loadingContainer}>
              <LoadingDots />
            </div>
          )}
        </div>
        {!hideText && (
          <Box sx={{ color: labelColor }}>
            <ContentEditor
              code={qualifiedCode}
              showToolbar={false}
              editable={contentEditable(designMode)}
              extended={false}
              centerText
              placeholder={
                onMainLang
                  ? t("content_editor_placeholder_option", {
                      lng: langInfo.mainLang,
                    })
                  : mainContent ||
                    t("content_editor_placeholder_option", {
                      lng: langInfo.mainLang,
                    })
              }
              contentKey="label"
            />
          </Box>
        )}
      </Grid>
    </>
  );
}

export default ImageChoiceItemDesign;
