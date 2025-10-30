import React, { useEffect, useRef, useState } from "react";
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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { previewUrlByResponseIdAndFilename } from "~/networking/run";

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

function ClampTwoLines({ children, sx }) {
  return (
    <Box
      sx={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function ResponsesSurvey() {
  const surveyService = useService("survey");
  const { t } = useTranslation("manage");
  const { surveyId } = useParams();

  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState("all");
  const [surveyor, setSurveyor] = useState(null);

  const [allResponse, setAllResponse] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [canExportFiles, setCanExportFiles] = useState(false);
  const [askedAboutFiles, setAskedAboutFiles] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [exportDlgOpen, setExportDlgOpen] = useState(false);
  const [downloadDlgOpen, setDownloadDlgOpen] = useState(false);
  const firstFetchThisVisitRef = useRef(true);

  const processApirror = () => setFetching(false);

  const fetchResponses = (deleted = false) => {
    setFetching(true);

    const confirmFilesExport = firstFetchThisVisitRef.current === true;

    surveyService
      .allResponse(
        surveyId,
        page,
        rowsPerPage,
        status,
        surveyor,
        !askedAboutFiles
      )
      .then((data) => {
        if (data) {
          setAskedAboutFiles(true);
          const totalPages = Math.ceil(data.totalCount / rowsPerPage) || 1;
          const newPage = page > totalPages ? totalPages : page;
          if (deleted && page > totalPages) setPage(newPage);
          if (!askedAboutFiles) {
            setAskedAboutFiles(true);
            setCanExportFiles(data.canExportFiles);
          }
          setAllResponse(data);
        }
        setFetching(false);
      })
      .catch((err) => {
        processApirror(err);
        console.error(err);
        setFetching(false);
      })
      .finally(() => {
        if (firstFetchThisVisitRef.current) {
          firstFetchThisVisitRef.current = false;
        }
      });
  };

  const isFileObj = (v) =>
    v &&
    typeof v === "object" &&
    "size" in v &&
    "filename" in v &&
    "stored_filename" in v;

  const getTooltipString = (val) => {
    if (val === null || val === undefined || val === "") return "—";
    if (Array.isArray(val) && val.every(isFileObj)) {
      return val
        .map((f) => `${f.filename} (${Math.round(f.size / 1000)}K)`)
        .join(", ");
    }
    if (isFileObj(val)) {
      return `${val.filename} (${Math.round(val.size / 1000)}K)`;
    }
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val);
  };

  const renderAnswerClamped = (key, respId, val) => {
    if (val === null || val === undefined || val === "") {
      return <Typography>—</Typography>;
    }

    if (Array.isArray(val) && val.every(isFileObj)) {
      return (
        <ClampTwoLines>
          <Box display="inline" sx={{ wordBreak: "break-word" }}>
            {val.map((file, idx) => (
              <React.Fragment key={file.stored_filename}>
                {idx > 0 ? ", " : null}
                {renderFileLink(key, respId, file)}
              </React.Fragment>
            ))}
          </Box>
        </ClampTwoLines>
      );
    }

    if (isFileObj(val)) {
      return (
        <ClampTwoLines>
          <Box display="inline" sx={{ wordBreak: "break-word" }}>
            {renderFileLink(key, respId, val)}
          </Box>
        </ClampTwoLines>
      );
    }

    if (typeof val === "object") {
      return (
        <ClampTwoLines>
          <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(val)}
          </Typography>
        </ClampTwoLines>
      );
    }

    return (
      <ClampTwoLines>
        <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {String(val)}
        </Typography>
      </ClampTwoLines>
    );
  };

  const getQuestionCodeFromKey = (key) => {
    if (!key) return "";
    const first = String(key).split(".")[0].trim();
    const m = first.match(/[A-Za-z]+[A-Za-z0-9]*/);
    return (m && m[0]) || first;
  };

  const renderFileLink = (questionKey, respId, file) => {
    const code = getQuestionCodeFromKey(questionKey);
    return (
      <a
        key={file.stored_filename}
        target="_blank"
        rel="noreferrer"
        download={file.stored_filename}
        href={previewUrlByResponseIdAndFilename(respId, file.stored_filename)}
        style={{ wordBreak: "break-all" }}
      >
        {file.filename} — {Math.round(file.size / 1000)}K
      </a>
    );
  };

  useEffect(() => {
    firstFetchThisVisitRef.current = true;
  }, [surveyId]);

  useEffect(() => {
    fetchResponses();
  }, [page, rowsPerPage, status, surveyor]);

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
      });
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
    setCompleteResponses("all");
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
              flexWrap="wrap"
            >
              <Box display="flex" gap={1} flexWrap="wrap">
                <FormControl size="small" sx={{ width: 300 }}>
                  <RHFSelect
                    label={t("responses.filter_by_type")}
                    value={status}
                    onChange={(e) => {
                      setPage(1);
                      setStatus(e.target.value);
                    }}
                  >
                    <MenuItem value="all">
                      {t("responses.filter_completed_show_all")}
                    </MenuItem>
                    <MenuItem value="preview">
                      {t("responses.filter_preview_show_preview")}
                    </MenuItem>
                    <MenuItem value="complete">
                      {t("responses.filter_completed_show_completed")}
                    </MenuItem>
                    <MenuItem value="incomplete">
                      {t("responses.filter_completed_show_incomplete")}
                    </MenuItem>
                  </RHFSelect>
                </FormControl>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setExportDlgOpen(true)}
                >
                  <FileUploadOutlined />
                </Button>

                {canExportFiles && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setDownloadDlgOpen(true)}
                  >
                    <FileDownloadOutlined />
                  </Button>
                )}
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
                              {r.preview ? (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={t("responses.preview")}
                                />
                              ) : r.submitDate ? (
                                <Chip
                                  size="small"
                                  label={t("responses.complete_response")}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  color="secondary"
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
              <Box display="flex" flexDirection="column" gap={3}>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", lg: "500px 1fr" }}
                >
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
                    value={t(`language.${selected.lang}`) || "—"}
                  />
                  <InfoItem
                    label={t("responses.status") || "Status"}
                    value={
                      selected.preview ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={t("responses.preview")}
                        />
                      ) : selected.submitDate ? (
                        <Chip
                          size="small"
                          label={t("responses.complete_response")}
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="secondary"
                          label={t("responses.incomplete_response")}
                        />
                      )
                    }
                  />
                  <InfoItem
                    label={t("responses.disqualified")}
                    value={
                      selected.disqualified
                        ? t("responses.yes")
                        : t("responses.no")
                    }
                  />
                </Box>
                {selected.values && Object.keys(selected.values).length > 0 && (
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t("responses.answers", "Answers")}
                    </Typography>

                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small" aria-label="answers table">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: "33%" }}>
                              {t("responses.question")}
                            </TableCell>
                            <TableCell sx={{ width: "67%" }}>
                              {t("responses.answer")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(selected.values).map(([key, val]) => {
                            const answerTooltip = getTooltipString(val.value);
                            const questionTooltip = getTooltipString(key);
                            return (
                              <TableRow key={key} hover>
                                <TableCell
                                  sx={{
                                    verticalAlign: "top",
                                    maxWidth: 0,
                                  }}
                                >
                                  <ClampTwoLines>
                                    <CustomTooltip
                                      showIcon={false}
                                      title={questionTooltip}
                                    >
                                      <Typography
                                        color="text.secondary"
                                        fontWeight={500}
                                        sx={{
                                          wordBreak: "break-word",
                                          whiteSpace: "pre-wrap",
                                        }}
                                      >
                                        {key}
                                      </Typography>
                                    </CustomTooltip>
                                  </ClampTwoLines>
                                </TableCell>

                                <TableCell
                                  sx={{
                                    verticalAlign: "top",
                                    maxWidth: 0,
                                  }}
                                >
                                  {answerTooltip.length > 20 ? (
                                    <CustomTooltip
                                      showIcon={false}
                                      title={answerTooltip}
                                    >
                                      <Box>
                                        {renderAnswerClamped(
                                          key,
                                          selected.id,
                                          val.value
                                        )}
                                      </Box>
                                    </CustomTooltip>
                                  ) : (
                                    <Box>
                                      {renderAnswerClamped(
                                        key,
                                        selected.id,
                                        val.value
                                      )}
                                    </Box>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
          {Boolean(responseToDelete) && (
            <ResponseDelete
              onDelete={deleteResponse}
              open={Boolean(responseToDelete)}
              onClose={onCloseModal}
            />
          )}
        </Box>
      </Box>
    </>
  );
}

export default React.memo(ResponsesSurvey);
