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
import styles from "./SCQArrayDesign.module.css";

function SCQIconArray(props) {
  let columns = props.component.answers.filter(
    (answer) => answer.type == "column"
  );
  let rows = props.component.answers.filter((answer) => answer.type == "row");

  return (
    <TableContainer>
      <Table>
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

  const isDirty =  useSelector((state) => state.templateState[props.answer.qualifiedCode]?.isDirty)
  const show_errors =  useSelector((state) => state.runState.values.Survey.show_errors)
  const state = useSelector((state) => state.runState.values[props.answer.qualifiedCode])
  const validity = React.useMemo(()=>state?.validity,[state])
  const value = React.useMemo(()=>state?.value,[state])
  const relevance = React.useMemo(()=>state?.relevance,[state])

  const dispatch = useDispatch();

  const handleChange = (value) => {
    dispatch(
      valueChange({
        componentCode: props.answer.qualifiedCode,
        value: value,
      })
    );
  };

  const invalid =
    (show_errors || isDirty) && validity === false;

  return typeof relevance === "undefined" || relevance ? (
    <React.Fragment>
      <TableRow key={props.answer.code}>
        <TableCell
          sx={{
            fontFamily: theme.textStyles.text.font,
            color: theme.textStyles.text.color,
            fontSize: theme.textStyles.text.size,
            borderBottom: invalid ? "0" : "",
            padding: "8px",
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
                padding: "8px",
              }}
            >
              <div
                onClick={() => handleChange(option.code)}
                style={{
                  opacity: value == option.code ? 1 : 0.2,
                  height: "64px",
                  width: "px",
                  borderRadius: "8px",
                  color: value == option.code ? theme.palette.primary.main : theme.textStyles.text.color
                }}
                className={styles.svgContainer}
                dangerouslySetInnerHTML={{ __html: option.icon || "" }}
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

export default SCQIconArray;
