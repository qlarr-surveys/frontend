import styles from "./SCQArrayDesign.module.css";

import {
  Box,
  Button,
  Checkbox,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import React, { useRef, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  addNewAnswer,
  addNewAnswers,
  changeContent,
  onDrag,
  onNewLine,
  removeAnswer,
} from "~/state/design/designState";
import { useDispatch } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { rtlLanguage } from "~/utils/common";
import { contentEditable, inDesign } from "~/routes";
import { columnMinWidth } from "~/utils/design/utils";
import { sanitizePastedText } from "~/components/design/ContentEditor/QuillEditor";

function ArrayDesign(props) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const t = props.t;

  const { header, rowLabel } = columnMinWidth(props.code);
  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const children = useSelector(
    (state) => state.designState[props.code].children
  );
  const rows = React.useMemo(
    () => children?.filter((el) => el.type == "row") || [],
    [children]
  );

  const columns = React.useMemo(
    () => children?.filter((el) => el.type == "column") || [],
    [children]
  );

  return (
    <>
      {inDesign(props.designMode) && (
        <div className={styles.addColumn}>
          <Button
            size="small"
            onClick={(e) =>
              dispatch(
                addNewAnswer({ questionCode: props.code, type: "column" })
              )
            }
          >
            {t("add_column")}
          </Button>
        </div>
      )}

      <TableContainer
        sx={{
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        <Table
          sx={{
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  padding: "2px",
                  width: rowLabel + "px",
                }}
                key="move"
              ></TableCell>
              {columns.map((item, index) => {
                return (
                  <ArrayHeaderDesign
                    parentQualifiedCode={props.qualifiedCode}
                    langInfo={langInfo}
                    designMode={props.designMode}
                    width={header}
                    t={props.t}
                    key={item.qualifiedCode}
                    item={item}
                    index={index}
                  />
                );
              })}
              {inDesign(props.designMode) && (
                <TableCell
                  sx={{
                    width: "20px",
                    padding: "0",
                  }}
                  key="remove"
                ></TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item, index) => {
              return (
                <ArrayRowDesign
                  parentQualifiedCode={props.code}
                  type={props.type}
                  langInfo={langInfo}
                  t={props.t}
                  designMode={props.designMode}
                  key={item.qualifiedCode}
                  item={item}
                  colCount={columns.length}
                  index={index}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {props.onMainLang && (
        <div className={styles.addRow}>
          <Button
            size="small"
            onClick={(e) =>
              dispatch(addNewAnswer({ questionCode: props.code, type: "row" }))
            }
          >
            {t("add_row")}
          </Button>
        </div>
      )}
    </>
  );
}

export default React.memo(ArrayDesign);

function ArrayRowDesign({
  item,
  index,
  colCount,
  designMode,
  type,
  t,
  langInfo,
  parentQualifiedCode,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef();
  const inputRef = useRef();

  const onMainLang = langInfo.lang === langInfo.mainLang;

  const content = useSelector((state) => {
    return state.designState[item.qualifiedCode].content?.[langInfo.lang]?.[
      "label"
    ];
  });

  const inFocus = useSelector((state) => {
    return state.designState.focus == item.qualifiedCode;
  });

  const mainContent = useSelector((state) => {
    return state.designState[item.qualifiedCode].content?.[langInfo.mainLang]?.[
      "label"
    ];
  });
  const itemType = `col-${parentQualifiedCode}`;

  const [isDragging, drag, preview] = useDrag(
    {
      type: itemType,
      item: {
        qualifiedCode: item.qualifiedCode,
        index: index,
      },
      collect: (monitor) => monitor.isDragging(),
    },
    [index]
  );

  useEffect(() => {
    if (inFocus) {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  }, [inFocus, inputRef.current]);

  const [{ handlerId }, drop] = useDrop({
    accept: itemType,
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
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      dispatch(
        onDrag({
          type: "reorder_answers_by_type",
          id: item.qualifiedCode,
          fromIndex: item.index,
          toIndex: hoverIndex,
        })
      );
      item.index = hoverIndex;
    },
  });

  drop(preview(ref));
  return (
    <TableRow
      data-code={item.code}
      style={{
        opacity: isDragging ? "0.2" : "1",
      }}
      ref={ref}
      key={item.code}
      data-handler-id={handlerId}
    >
      <TableCell
        sx={{
          padding: "2px",
        }}
      >
        <Box display="flex" alignItems="center">
          {inDesign(designMode) && (
            <div ref={drag}>
              <DragIndicatorIcon color="action" />
            </div>
          )}
          <TextField
            inputRef={inputRef}
            variant="standard"
            value={content || ""}
            onChange={(e) => {
              if (!contentEditable(designMode)) {
                return;
              }
              const value = e.target.value;
              if (value.endsWith("\n")) {
                dispatch(
                  onNewLine({
                    questionCode: parentQualifiedCode,
                    index,
                    type: "row",
                  })
                );
              } else {
                const sanitizedText = sanitizePastedText(e.target.value);
                const text = sanitizedText[0];
                const rest = sanitizedText.slice(1);
                if (rest.length > 0) {
                  dispatch(
                    addNewAnswers({
                      questionCode: parentQualifiedCode,
                      index,
                      type: "row",
                      data: rest,
                    })
                  );
                }
                dispatch(
                  changeContent({
                    code: item.qualifiedCode,
                    key: "label",
                    lang: langInfo.lang,
                    value: text,
                  })
                );
              }
            }}
            placeholder={
              onMainLang
                ? t("content_editor_placeholder_option")
                : mainContent || t("content_editor_placeholder_option")
            }
            multiline
            InputProps={{
              disableUnderline: true,
            }}
          />
        </Box>
      </TableCell>

      {[...Array(colCount)].map((_option, index) => {
        return (
          <TableCell
            key={index}
            scope="row"
            align="center"
            sx={{
              padding: "0px",
            }}
          >
            {type === "scq_array" ? <Radio /> : <Checkbox />}
          </TableCell>
        );
      })}
      {inDesign(designMode) && (
        <TableCell
          onClick={(e) => dispatch(removeAnswer(item.qualifiedCode))}
          key="remove"
          sx={{
            width: "30px",
            padding: "0",
          }}
        >
          <CloseIcon color="action" />
        </TableCell>
      )}
    </TableRow>
  );
}

function ArrayHeaderDesign({
  item,
  index,
  designMode,
  t,
  langInfo,
  parentQualifiedCode,
  width,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef();

  const onMainLang = langInfo.lang === langInfo.mainLang;

  const isRtl = rtlLanguage.includes(langInfo.lang);
  const isLtr = !isRtl;

  const content = useSelector((state) => {
    return state.designState[item.qualifiedCode].content?.[langInfo.lang]?.[
      "label"
    ];
  });

  const mainContent = useSelector((state) => {
    return state.designState[item.qualifiedCode].content?.[langInfo.mainLang]?.[
      "label"
    ];
  });
  const itemType = `row-${parentQualifiedCode}`;

  const [isDragging, drag, preview] = useDrag(
    {
      type: itemType,
      item: {
        qualifiedCode: item.qualifiedCode,
        index: index,
      },
      collect: (monitor) => monitor.isDragging(),
    },
    [index]
  );

  const [{ handlerId }, drop] = useDrop({
    accept: itemType,
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
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      if (isLtr && dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      if (isLtr && dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      if (isRtl && dragIndex < hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      if (isRtl && dragIndex > hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      dispatch(
        onDrag({
          type: "reorder_answers_by_type",
          id: item.qualifiedCode,
          fromIndex: item.index,
          toIndex: hoverIndex,
        })
      );
      item.index = hoverIndex;
    },
  });

  drop(preview(ref));
  return (
    <TableCell
      ref={ref}
      data-handler-id={handlerId}
      align="center"
      sx={{
        opacity: isDragging ? "0.2" : "1",
        padding: "2px",
        width: width + "px",
      }}
      style={{ width: width + "px" }}
      key={item.qualifiedCode}
    >
      {inDesign(designMode) && (
        <div style={{ display: "inline-flex" }}>
          <div
            ref={drag}
            key="move"
            sx={{
              padding: "0",
            }}
          >
            <DragIndicatorIcon color="action" />
          </div>
          <div
            sx={{
              padding: "0",
            }}
            onClick={(e) => dispatch(removeAnswer(item.qualifiedCode))}
          >
            <CloseIcon color="action" />
          </div>
        </div>
      )}

      <TextField
        variant="standard"
        value={content || ""}
        multiline
        onChange={(e) => {
          if (!contentEditable(designMode)) {
            return;
          }
          dispatch(
            changeContent({
              code: item.qualifiedCode,
              key: "label",
              lang: langInfo.lang,
              value: e.target.value,
            })
          );
        }}
        placeholder={
          onMainLang
            ? t("content_editor_placeholder_option")
            : mainContent || t("content_editor_placeholder_option")
        }
        inputProps={{ style: { textAlign: "center" } }}
        InputProps={{
          disableUnderline: true,
        }}
      />
    </TableCell>
  );
}
