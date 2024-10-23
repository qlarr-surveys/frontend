import styles from "./SCQArrayDesign.module.css";

import {
  Button,
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
import React, { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  changeAttribute,
  changeContent,
  onDrag,
  removeAnswer,
} from "~/state/design/designState";
import { useDispatch } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { rtlLanguage } from "~/utils/common";
import AddBoxIcon from "@mui/icons-material/AddBox";
import IconSelector from "~/components/design/IconSelector";
import { getContrastColor } from "../utils";

function SCQIconArrayDesign(props) {
  const theme = useTheme();
  const t = props.t;

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });
  const onMainLang = langInfo.lang === langInfo.mainLang;

  const children = useSelector((state) => {
    return state.designState[props.code].children;
  });

  const rows = children?.filter((el) => el.type == "row") || [];
  const columns = children?.filter((el) => el.type == "column") || [];

  const icons = useSelector((state) =>
    columns.map((col) => state.designState[col.qualifiedCode].icon)
  );

  return (
    <>
      {props.onMainLang && (
        <div className={styles.addColumn}>
          <Button
            sx={{
              fontFamily: theme.textStyles.text.font,
              fontSize: theme.textStyles.text.size,
              color: theme.textStyles.question.color,
            }}
            size="small"
            onClick={(e) =>
              props.addNewAnswer(props.code, props.type, "column")
            }
          >
            {t("add_column")}
          </Button>
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {onMainLang && (
                <TableCell
                  sx={{
                    padding: "0",

                  }}
                  key="move"
                ></TableCell>
              )}
              <TableCell key="content"></TableCell>
              {columns.map((item, index) => {
                return (
                  <SCQArrayHeaderDesign
                    parentQualifiedCode={props.qualifiedCode}
                    langInfo={langInfo}
                    t={props.t}
                    key={item.qualifiedCode}
                    item={item}
                    icons={icons}
                    styles={styles}
                    index={index}
                  />
                );
              })}
              {onMainLang && (
                <TableCell
                  sx={{
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
                <SCQArrayRowDesign
                  parentQualifiedCode={props.qualifiedCode}
                  langInfo={langInfo}
                  t={props.t}
                  key={item.qualifiedCode}
                  item={item}
                  columns={columns}
                  icons={icons}
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
            sx={{
              fontFamily: theme.textStyles.text.font,
              fontSize: theme.textStyles.text.size,
              color: theme.textStyles.question.color,
            }}
            size="small"
            onClick={(e) => props.addNewAnswer(props.code, props.type, "row")}
          >
            {t("add_row")}
          </Button>
        </div>
      )}
    </>
  );
}

export default React.memo(SCQIconArrayDesign);

function SCQArrayRowDesign({
  item,
  index,
  columns,
  icons,
  t,
  langInfo,
  parentQualifiedCode,
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef();

  const onMainLang = langInfo.lang === langInfo.mainLang;

  const content = useSelector((state) => {
    return state.designState[item.qualifiedCode].content?.["label"]?.[
      langInfo.lang
    ];
  });

  const mainContent = useSelector((state) => {
    return state.designState[item.qualifiedCode].content?.["label"]?.[
      langInfo.mainLang
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
      style={{
        opacity: isDragging ? "0.2" : "1",
      }}
      ref={ref}
      key={item.code}
      data-handler-id={handlerId}
    >
      {onMainLang && (
        <TableCell
          ref={drag}
          key="move"
          sx={{
            padding: "0",
            color: theme.textStyles.text.color

          }}
        >
          <DragIndicatorIcon />
        </TableCell>
      )}
      <TableCell
        sx={{
          fontFamily: theme.textStyles.text.font,
          color: theme.textStyles.text.color,
          fontSize: theme.textStyles.text.size,
          padding: "4px",
        }}
      >
        <TextField
          variant="standard"
          value={content || ""}
          onChange={(e) => {
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
          InputProps={{
            disableUnderline: true,
            sx: {
              fontFamily: theme.textStyles.text.font,
              color: theme.textStyles.text.color,
              fontSize: theme.textStyles.text.size,
            },
          }}
        />
      </TableCell>
      {columns.map((option, index) => {
        return (
          <TableCell
            key={index}
            scope="row"
            align="center"
            sx={{
              padding: "4px",
            }}
          >
            {icons[index] && (
              <div
                style={{
                  opacity: 0.2,
                  height: "64px",
                  width: "px",
                  borderRadius: "8px",
                  color: theme.textStyles.text.color
                }}
                className={styles.svgContainer}
                dangerouslySetInnerHTML={{
                  __html: icons[index],
                }}
              />
            )}
          </TableCell>
        );
      })}
      {onMainLang && (
        <TableCell
          onClick={(e) => dispatch(removeAnswer(item.qualifiedCode))}
          key="remove"
          sx={{
            padding: "0",
            color: theme.textStyles.text.color
          }}
        >
          <CloseIcon />
        </TableCell>
      )}
    </TableRow>
  );
}

function SCQArrayHeaderDesign({
  item,
  index,
  icons,
  t,
  langInfo,
  parentQualifiedCode,
  styles,
}) {
  const icon = icons[index];
  const [iconSelectoOpen, setIconSelectorOpen] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef();

  const onMainLang = langInfo.lang === langInfo.mainLang;

  const isRtl = rtlLanguage.includes(langInfo.lang);
  const isLtr = !isRtl;

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
    <>
      <TableCell
        ref={ref}
        data-handler-id={handlerId}
        align="center"
        sx={{
          opacity: isDragging ? "0.2" : "1",
          fontFamily: theme.textStyles.text.font,
          color: theme.textStyles.text.color,
          fontSize: theme.textStyles.text.size,
          padding: "4px",
        }}
        key={item.qualifiedCode}
      >
        {onMainLang && (
          <div style={{ display: "inline-flex" }}>
            <div
              ref={drag}
              key="move"
              sx={{
                padding: "0",
              }}
            >
              < DragIndicatorIcon />
            </div>
            <div
              sx={{
                padding: "0",
                color: theme.textStyles.text.color

              }}
              onClick={(e) => dispatch(removeAnswer(item.qualifiedCode))}
            >
              <CloseIcon />
            </div>
          </div>
        )}
        

        {icon ? (
          <div
            onClick={() => setIconSelectorOpen(true)}
            style={{
              height: "64px",
              width: "px",
              borderRadius: "8px",
            }}
            className={styles.svgContainer}
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        ) : (
          <>
            <br />
            <div onClick={() => setIconSelectorOpen(true)}>
              <AddBoxIcon sx={{ width: "64px", height: "64px" }} />
              <br />
              <span>Click to add icon</span>
            </div>
          </>
        )}
      </TableCell>
      {iconSelectoOpen && (
        <IconSelector
          currentIcon=""
          onIconSelected={(icon) => {
            dispatch(
              changeAttribute({
                code: item.qualifiedCode,
                key: "icon",
                value: icon,
              })
            );
            setIconSelectorOpen(false);
          }}
        />
      )}
    </>
  );
}
