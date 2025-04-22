import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@emotion/react";
import { shallowEqual, useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Radio } from "@mui/material";
import { valueChange } from "~/state/runState";
import Validation from "~/components/run/Validation";

function SCQArray(props) {
  const theme = useTheme();
  let columns = props.component.answers.filter(
    (answer) => answer.type == "column"
  );
  let rows = props.component.answers.filter((answer) => answer.type == "row");

  return (
    <TableContainer>
      <Table sx={{ width: "100%", tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell key="content" sx={{ width: "33%" }}></TableCell>
            {columns.map((option) => {
              return (
                <TableCell
                  sx={{
                    fontFamily: theme.textStyles.text.font,
                    color: theme.textStyles.text.color,
                    padding: "2px",
                    fontSize: theme.textStyles.text.size,
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
  const state = useSelector((state) => {
    return {
      show_errors: state.runState.values.Survey.show_errors,
      validity: state.runState.values[props.answer.qualifiedCode]?.validity,
      value: state.runState.values[props.answer.qualifiedCode]?.value,
      relevance: state.runState.values[props.answer.qualifiedCode]?.relevance,
    };
  }, shallowEqual);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    dispatch(
      valueChange({
        componentCode: event.target.name,
        value: event.target.value,
      })
    );
  };

  const invalid =
    (state.show_errors || state.isDirty) && state.validity === false;

  return typeof state.relevance === "undefined" || state.relevance ? (
    <React.Fragment>
      <TableRow key={props.answer.code}>
        <TableCell
          sx={{
            fontFamily: theme.textStyles.text.font,
            color: theme.textStyles.text.color,
            fontSize: theme.textStyles.text.size,
            borderBottom: invalid ? "0" : "",
            padding: "2px",
            wordWrap: "break-word",
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
              }}
            >
              <Radio
                name={props.answer.qualifiedCode}
                onChange={handleChange}
                checked={state.value === option.code}
                value={option.code}
                sx={{
                  color: theme.textStyles.text.color,
                }}
              />
            </TableCell>
          );
        })}
      </TableRow>
      {invalid ? (
        <TableRow>
          <TableCell
            sx={{ padding: "8px" }}
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

export default SCQArray;
