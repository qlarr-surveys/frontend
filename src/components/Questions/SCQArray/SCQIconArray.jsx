import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { valueChange } from "~/state/runState";
import Validation from "~/components/run/Validation";
import DynamicSvg from "~/components/DynamicSvg";
import { buildResourceUrl } from "~/networking/common";
import { TableHead } from "@mui/material";
import { columnMinWidth } from '~/utils/design/utils';

function SCQIconArray(props) {
  const theme = useTheme();
  const width = columnMinWidth()

  let columns = props.component.answers.filter(
    (answer) => answer.type == "column"
  );
  let rows = props.component.answers.filter((answer) => answer.type == "row");

  return (
    <TableContainer
      sx={{
        overflowX: "auto",
        maxWidth: "100%",
      }}
    >
      <Table
        sx={{ tableLayout: "fixed", minWidth: `${columns.length * width}px` }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              key="content"
              sx={{
                width: width,
                padding: "0px",
              }}
            ></TableCell>
            {columns.map((option) => {
              return (
                <TableCell
                  sx={{
                    textAlign: "center",
                    width: width,
                  }}
                  key={option.qualifiedCode}
                >
                  {option.content?.label}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((answer) => {
            return (
              <React.Fragment key={answer.qualifiedCode}>
                <SCQArrayRow
                  key={answer.qualifiedCode}
                  answer={answer}
                  choices={columns}
                  width={width}
                />
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SCQArrayRow(props) {
  const theme = useTheme();

  const isDirty = useSelector(
    (state) => state.templateState[props.answer.qualifiedCode]?.isDirty
  );
  const show_errors = useSelector(
    (state) => state.runState.values.Survey.show_errors
  );
  const state = useSelector(
    (state) => state.runState.values[props.answer.qualifiedCode]
  );
  const validity = React.useMemo(() => state?.validity, [state]);
  const value = React.useMemo(() => state?.value, [state]);
  const relevance = React.useMemo(() => state?.relevance, [state]);

  const dispatch = useDispatch();

  const handleChange = (value) => {
    dispatch(
      valueChange({
        componentCode: props.answer.qualifiedCode,
        value: value,
      })
    );
  };

  const invalid = (show_errors || isDirty) && validity === false;

  return typeof relevance === "undefined" || relevance ? (
    <React.Fragment>
      <TableRow key={props.answer.code}>
        <TableCell
          sx={{
            borderBottom: invalid ? "0" : "",
            padding: "2px",
          }}
        >
          {props.answer.content?.label}
        </TableCell>
        {props.choices.map((option) => {
          return (
            <TableCell
              key={option.code}
              component="th"
              scope="row"
              sx={{
                borderBottom: invalid ? "0" : "",
                padding: "2px",
                width: props.width,
              }}
            >
              <DynamicSvg
                onIconClick={() => handleChange(option.code)}
                imageHeight={"64px"}
                isSelected={value == option.code}
                theme={theme}
                svgUrl={
                  option?.resources?.icon
                    ? buildResourceUrl(option?.resources?.icon)
                    : undefined
                }
              />
            </TableCell>
          );
        })}
      </TableRow>
      {invalid ? (
        <TableRow>
          <TableCell
            sx={{ padding: "2px" }}
            colSpan={props.choices ? props.choices.length + 1 : 1}
          >
            <Validation component={props.answer} />
          </TableCell>
        </TableRow>
      ) : (
        ""
      )}
    </React.Fragment>
  ) : (
    ""
  );
}

export default SCQIconArray;
