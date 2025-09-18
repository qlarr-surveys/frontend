import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  TablePagination,
  Typography,
  FormControl,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FileDownloadOutlined, FileUploadOutlined } from "@mui/icons-material";

import styles from "./ResponsesSurvey.module.css";
import {
  formatlocalDateTime,
  serverDateTimeToLocalDateTime,
} from "~/utils/DateUtils";
import { ResponseDelete } from "~/components/manage/ResponseDelete";
import { RHFSelect } from "~/components/hook-form";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import ResponsesDownload from "~/components/manage/ResponsesDownload";
import ResponsesExport from "~/components/manage/ResponsesExport";

function InfoItem({ label, value }) {
  return (
    <Box display="grid" gridTemplateColumns="160px 1fr" gap={1} py={0.5}>
      <Typography color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography>{value ?? "—"}</Typography>
    </Box>
  );
}

function ResponsesSurvey() {
  const surveyService = useService("survey");
  const { t } = useTranslation("manage");
  const { surveyId } = useParams();

  const [fetching, setFetching] = useState(true);
  const [dbResponses, setDbResponses] = useState(false);
  const [completeResponses, setCompleteResponses] = useState("none");
  const [surveyor, setSurveyor] = useState(null);

  const [allResponse, setAllResponse] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [exportDlgOpen, setExportDlgOpen] = useState(false);
  const [downloadDlgOpen, setDownloadDlgOpen] = useState(false);

  const processApirror = () => setFetching(false);

  const findBoolean = (v) =>
    v === "true" ? true : v === "false" ? false : undefined;

  const fetchResponses = (deleted = false) => {
    setFetching(true);
    const completed = findBoolean(completeResponses);
    const status =
      completed === true
        ? "COMPLETE"
        : completed === false
        ? "INCOMPLETE"
        : undefined;
    surveyService
      .allResponse(surveyId, page, rowsPerPage, status, surveyor)
      .then((data) => {
        if (data) {
          const totalPages = Math.ceil(data.totalCount / rowsPerPage) || 1;
          const newPage = page > totalPages ? totalPages : page;
          if (deleted && page > totalPages) setPage(newPage);

          setAllResponse(data);

        }
        setFetching(false);
      })
      .catch((err) => {
        processApirror(err);
        console.error(err);
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchResponses();
  }, [page, rowsPerPage, dbResponses, completeResponses, surveyor]);

  useEffect(() => {
    if (!responseId) {
      return;
    }
    surveyService
      .getResponseById(responseId)
      .then((data) => {
        setSelected(data);
      })
      .catch((err) => {
        console.error(err);
      })
  }, [responseId]);


  const [responseToDelete, setResponseToDelete] = useState(null);
  const onCloseModal = () => setResponseToDelete(null);
  const deleteResponse = () => {
    if (!responseToDelete) return;
    onCloseModal();
    surveyService
      .deleteResponse(surveyId, responseToDelete.id)
      .then(() => fetchResponses(true))
      .catch(processApirror);
  };

  const onSurveyorClicked = (response) => {
    setCompleteResponses("none");
    setSurveyor(response.surveyorID || null);
  };

  if (fetching && !allResponse) {
    return (
      <div className={styles.loadingWrapper}>
        <LoadingDots fullHeight />
      </div>
    );
  }
  return (
    <>
      <ResponsesExport
        open={exportDlgOpen}
        onClose={() => setExportDlgOpen(false)}
        maxCount={allResponse?.totalCount || 1}
        t={t}
      />

      <ResponsesDownload
        open={downloadDlgOpen}
        onClose={() => setDownloadDlgOpen(false)}
        maxCount={allResponse?.totalCount || 1}
        t={t}
      />

      <Box className={styles.mainContainer}>
        {surveyor && (
          <Box mb={1}>
            <Button sx={{ m: 1 }} onClick={() => setSurveyor(null)}>
              {t("responses.reset_surveyor_filter")}
            </Button>
          </Box>
        )}

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "500px 1fr" }}
          gap={2}
          minHeight={520}
        >
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              px={2}
              py={1.5}
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="space-between"
            >
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <RHFSelect
                  label={t("responses.filter_by_type")}
                  value={completeResponses}
                  onChange={(e) => {
                    setPage(1);
                    setCompleteResponses(e.target.value);
                  }}
                >
                  <MenuItem value="none">
                    {t("responses.filter_completed_show_all")}
                  </MenuItem>
                  <MenuItem value="true">
                    {t("responses.filter_completed_show_completed")}
                  </MenuItem>
                  <MenuItem value="false">
                    {t("responses.filter_completed_show_incomplete")}
                  </MenuItem>
                </RHFSelect>
              </FormControl>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setExportDlgOpen(true)}
                >
                  <FileUploadOutlined />
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setDownloadDlgOpen(true)}
                >
                  <FileDownloadOutlined />
                </Button>
              </Box>
            </Box>
            <Divider />
            {fetching ? (
              <Box p={2}>
                {[...Array(8)].map((_, i) => (
                  <Box
                    key={i}
                    display="flex"
                    alignItems="center"
                    gap={2}
                    py={1}
                  >
                    <Skeleton variant="rounded" width={28} height={24} />
                    <Skeleton variant="text" width="50%" />
                    <Skeleton
                      variant="rounded"
                      width={80}
                      height={22}
                      style={{ marginLeft: "auto" }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <>
                <List dense disablePadding sx={{ overflowY: "auto", flex: 1 }}>
                  {allResponse?.responses.map((r) => {

                    const isSelected = responseId && responseId === r.id;

                    return (
                      <ListItemButton
                        key={r.id}
                        selected={isSelected}
                        onClick={() => setResponseId(r.id)}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" gap={1} alignItems="center">
                              <Typography fontWeight={600}>
                                #{r.index}
                              </Typography>
                              {r.submitDate ? (
                                <Chip
                                  size="small"
                                  label={t("responses.complete_response")}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={t("responses.incomplete_response")}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2">
                                {formatlocalDateTime(
                                  serverDateTimeToLocalDateTime(r.startDate)
                                )}
                              </Typography>
                              {r.surveyorName && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("label.surveyor")}:{" "}
                                  <Link
                                    to="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onSurveyorClicked(r);
                                    }}
                                  >
                                    {r.surveyorName}
                                  </Link>
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResponseToDelete(r);
                          }}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemButton>
                    );
                  })}
                </List>

                <Divider />
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  labelDisplayedRows={({ from, to, count }) =>
                    t("responses.label_displayed_rows", { from, to, count })
                  }
                  labelRowsPerPage={t("responses.label_rows_per_page")}
                  count={allResponse?.totalCount || 0}
                  rowsPerPage={rowsPerPage}
                  page={page - 1}
                  onPageChange={(_, newPage) => setPage(newPage + 1)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                />
              </>
            )}
          </Paper>

          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            {!selected ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">
                  {t("responses.no_selection", "Select a response")}
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}
                  columnGap={4}
                >
                  <Box>
                    <InfoItem label="ID" value={`#${selected.index}`} />
                    <InfoItem
                      label={t("label.surveyor")}
                      value={
                        selected.surveyorName ? (
                          <Link
                            to="#"
                            onClick={(e) => {
                              e.preventDefault();
                              onSurveyorClicked(selected);
                            }}
                          >
                            {selected.surveyorName}
                          </Link>
                        ) : (
                          "—"
                        )
                      }
                    />
                    <InfoItem
                      label={t("responses.ip_addr")}
                      value={selected.ipAddress || "—"}
                    />
                    <InfoItem
                      label={t("responses.start_date")}
                      value={formatlocalDateTime(
                        serverDateTimeToLocalDateTime(selected.startDate)
                      )}
                    />
                  </Box>
                  <Box>
                    <InfoItem
                      label={t("responses.submit_date")}
                      value={
                        selected.submitDate
                          ? formatlocalDateTime(
                              serverDateTimeToLocalDateTime(selected.submitDate)
                            )
                          : "—"
                      }
                    />
                    <InfoItem
                      label={t("responses.lang")}
                      value={selected.lang || "—"}
                    />
                    <InfoItem
                      label={t("responses.status") || "Status"}
                      value={
                        selected.submitDate ? (
                          <Chip
                            size="small"
                            label={t("responses.complete_response")}
                          />
                        ) : (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={t("responses.incomplete_response")}
                          />
                        )
                      }
                    />
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Box>

        {Boolean(responseToDelete) && (
          <ResponseDelete
            onDelete={deleteResponse}
            open={Boolean(responseToDelete)}
            onClose={onCloseModal}
          />
        )}
      </Box>
    </>
  );
}

export default React.memo(ResponsesSurvey);
