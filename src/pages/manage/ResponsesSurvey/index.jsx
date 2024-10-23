import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  TablePagination,
  IconButton,
  Button,
  Typography,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./ResponsesSurvey.module.css";
import {
  formatlocalDateTime,
  serverDateTimeToLocalDateTime,
} from "~/utils/DateUtils";
import { previewUrl } from "~/networking/run";
import { ResponseDelete } from "~/components/manage/ResponseDelete";
import FileSaver from "file-saver";
import { stripTags, truncateWithEllipsis } from "~/utils/design/utils";
import { RHFSwitch } from "~/components/hook-form";
import { ArrowOutward } from "@mui/icons-material";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";

function ResponsesSurvey({ viewEvents }) {
  const surveyService = useService("survey");

  const { t } = useTranslation("manage");
  const [fetching, setFetching] = useState(true);

  const [dbResponses, setDbResponses] = useState(false);
  const [completeResponses, setCompleteResponses] = useState("none");
  const [surveyor, setSurveyor] = useState(null);

  const { surveyId } = useParams();

  const processApirror = (e) => {
    setFetching(false);
  };
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [allResponse, setAllResponse] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const exportResponses = () => {
    setFetching(true);
    surveyService
      .exportResponses(surveyId, timezone, dbResponses, completeResponses)
      .then((data) => {
        if (data) {
          var file = new File([data], `${surveyId}-responses-export.csv`, {
            type: "text/csv;charset=utf-8",
          });
          FileSaver.saveAs(file);
        }
        setFetching(false);
      })
      .catch((err) => {
        processApirror(err);
      });
  };

  const onSurveyorClicked = (response) => {
    setCompleteResponses("none");
    setSurveyor(response.surveyorID);
  };

  const findBoolean = (response) => {
    switch (response) {
      case "true":
        return true;
      case "false":
        return false;
      case "none":
      default:
        return undefined;
    }
  };

  const fetchResponses = (deleted = false) => {
    setFetching(true);
    const updateCompleteResponses = findBoolean(completeResponses);

    surveyService
      .allResponse(
        surveyId,
        dbResponses,
        page,
        rowsPerPage,
        updateCompleteResponses,
        surveyor
      )
      .then((data) => {
        if (data) {
          const updatedTotalCount = data.totalCount;
          const totalPages = Math.ceil(updatedTotalCount / rowsPerPage);
          const newPage = page > totalPages ? totalPages : page;
          if (deleted && page > totalPages) {
            setPage(newPage + 1);
          }
          setAllResponse(data);
        }
        setFetching(false);
      })
      .catch((err) => {
        processApirror(err);
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchResponses();
  }, [page, rowsPerPage, dbResponses, completeResponses, surveyor]);

  const [responseToDelete, setResponseToDelete] = useState();
  const onCloseModal = () => {
    setResponseToDelete(null);
  };

  const deleteResponse = () => {
    onCloseModal();
    surveyService
      .deleteResponse(surveyId, responseToDelete.id)
      .then(() => {
        fetchResponses(true);
      })
      .catch((e) => {
        processApirror(e);
      });
  };
  const tabValues = {
    SHOW_ALL: "none",
    SHOW_COMPLETED: "true",
    SHOW_INCOMPLETE: "false",
  };

  return (
    <Box className={styles.mainContainer}>
      <Box
        display="flex"
        flexWrap={{ xs: "wrap", sm: "wrap", md: "nowrap" }}
        gap={10}
      >
        <Box width="100%" className={styles.cardContent}>
          <Typography variant="h5" color="primary" fontWeight={600}>
            {t("responses.raw_values")}
          </Typography>
          <RHFSwitch
            checked={dbResponses}
            onChange={(event) => {
              setDbResponses(event.target.checked);
            }}
          />
        </Box>
        <Box width="100%" className={styles.cardContent}>
          <Typography variant="h5" color="primary" fontWeight={600}>
            {t("responses.export")}
          </Typography>
          <Button
            sx={{ minWidth: "50px" }}
            color="primary"
            disabled={surveyor || false}
            size="small"
            variant="contained"
            onClick={() => exportResponses()}
          >
            <ArrowOutward />
          </Button>
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Typography
          color="primary"
          variant="h4"
          fontWeight={600}
          sx={{ width: "33%" }}
        >
          {t("responses.filter_completed")}
        </Typography>
        <Tabs
          sx={{ width: "100%" }}
          value={completeResponses}
          onChange={(event, newValue) => {
            setPage(1);
            setCompleteResponses(newValue);
          }}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab
            disabled={surveyor || false}
            label={t("responses.filter_completed_show_all")}
            value={tabValues.SHOW_ALL}
          />
          <Tab
            disabled={surveyor || false}
            label={t("responses.filter_completed_show_completed")}
            value={tabValues.SHOW_COMPLETED}
          />
          <Tab
            disabled={surveyor || false}
            label={t("responses.filter_completed_show_incomplete")}
            value={tabValues.SHOW_INCOMPLETE}
          />
        </Tabs>
      </Box>

      {surveyor && (
        <>
          <br />
          <Button sx={{ margin: "8px" }} onClick={() => setSurveyor(null)}>
            {t("responses.reset_surveyor_filter")}
          </Button>
        </>
      )}
      {fetching ? (
        <div className={styles.loadingWrapper}>
          <LoadingDots />
        </div>
      ) : (
        <Paper sx={{ width: "100%", background: "transparent", mb: 2 }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                {allResponse && (
                  <TableRow>
                    <TableCell key="btns" />
                    <TableCell key="id" align="left">
                      ID
                    </TableCell>

                    <TableCell key="surveyor" align="left">
                      {t("label.surveyor")}
                    </TableCell>

                    <TableCell key="ip" align="left">
                      {t("responses.ip_addr")}
                    </TableCell>
                    <TableCell key="start_date" align="left">
                      {t("responses.start_date")}
                    </TableCell>
                    <TableCell key="submit_date" align="left">
                      {t("responses.submit_date")}
                    </TableCell>
                    <TableCell key="lang" align="left">
                      {t("responses.lang")}
                    </TableCell>

                    {Object.values(allResponse?.columnNames).map((label) => {
                      return (
                        <TableCell key={label} align="left">
                          {stripTags(label)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {allResponse?.responses.map((response) => {
                  return (
                    <TableRow key={response.id} sx={{ minHeight: "100px" }}>
                      <TableCell key="btns" align="left">
                        <Box sx={{ display: "flex" }}>
                          <IconButton
                            onClick={() => {
                              setResponseToDelete(response);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell key="id" align="left">
                        {response.id}
                      </TableCell>

                      <TableCell key="surveyor" align="left">
                        {response.surveyorName ? (
                          <Link
                            onClick={() => {
                              onSurveyorClicked(response);
                            }}
                          >
                            {response.surveyorName}
                          </Link>
                        ) : (
                          ""
                        )}
                      </TableCell>

                      <TableCell key="ip" align="left">
                        {response.ipAddress}
                      </TableCell>
                      <TableCell key="startDate" align="left">
                        {formatlocalDateTime(
                          serverDateTimeToLocalDateTime(response.startDate)
                        )}
                      </TableCell>
                      <TableCell key="submitDate" align="left">
                        {response.submitDate
                          ? formatlocalDateTime(
                            serverDateTimeToLocalDateTime(response.submitDate)
                          )
                          : " - "}
                      </TableCell>
                      <TableCell key="lang" align="left">
                        {response.lang}
                      </TableCell>
                      {response.values.map((value, index) => {
                        return (
                          <TableCell align="left" key={index}>
                            {value === null ||
                              value === undefined ||
                              value === "" ? (
                              " - "
                            ) : typeof value === "string" ? (
                              <Tooltip title={value}>
                                <span>{truncateWithEllipsis(value, 25)}</span>
                              </Tooltip>
                            ) : typeof value === "object" &&
                              "size" in value &&
                              "filename" in value &&
                              "stored_filename" in value ? (
                              <a
                                target="_blank"
                                download={value.stored_filename}
                                href={previewUrl(value.stored_filename)}
                              >
                                {value.filename} -
                                {Math.round(value.size / 1000) + "K"}
                              </a>
                            ) : (
                              JSON.stringify(value)
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            labelDisplayedRows={({ from, to, count, page }) => {
              return t("responses.label_displayed_rows", { from, to, count });
            }}
            labelRowsPerPage={t("responses.label_rows_per_page")}
            count={allResponse?.totalCount}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(event, newPage) => {
              setPage(newPage + 1);
            }}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
          />
        </Paper>
      )}
      {Boolean(responseToDelete) && (
        <ResponseDelete
          onDelete={deleteResponse}
          open={Boolean(responseToDelete)}
          onClose={onCloseModal}
        />
      )}
    </Box>
  );
}

export default React.memo(ResponsesSurvey);
