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
  Menu,
  MenuItem,
  Paper,
  TablePagination,
  Typography,
  FormControl,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  RadioGroup,
  FormControlLabel,
  DialogActions,
  Radio,
  FormLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ArrowOutward,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";

import styles from "./ResponsesSurvey.module.css";
import {
  formatlocalDateTime,
  serverDateTimeToLocalDateTime,
} from "~/utils/DateUtils";
import { ResponseDelete } from "~/components/manage/ResponseDelete";
import FileSaver from "file-saver";
import { RHFSelect } from "~/components/hook-form";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

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
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  const [exportDlgOpen, setExportDlgOpen] = useState(false);
  const [downloadDlgOpen, setDownloadDlgOpen] = useState(false);

  const [exportFrom, setExportFrom] = useState(1);
  const [exportTo, setExportTo] = useState(1);
  const [exportFilter, setExportFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportMode, setExportMode] = useState("database");

  const [downloadFrom, setDownloadFrom] = useState(1);
  const [downloadTo, setDownloadTo] = useState(1);
  const [downloadFilter, setDownloadFilter] = useState("all");

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const processApirror = () => setFetching(false);

  const findBoolean = (v) =>
    v === "true" ? true : v === "false" ? false : undefined;

  const fetchResponses = (deleted = false) => {
    setFetching(true);
    const completed = findBoolean(completeResponses);

    surveyService
      .allResponse(
        surveyId,
        dbResponses,
        page,
        rowsPerPage,
        completed,
        surveyor
      )
      .then((data) => {
        if (data) {
          const totalPages = Math.ceil(data.totalCount / rowsPerPage) || 1;
          const newPage = page > totalPages ? totalPages : page;
          if (deleted && page > totalPages) setPage(newPage);

          setAllResponse(data);
          if (!selected || !data.responses.find((r) => r.id === selected.id)) {
            setSelected(data.responses[0] || null);
          }
        }
        setFetching(false);
      })
      .catch((err) => {
        processApirror(err);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchResponses();
  }, [page, rowsPerPage, dbResponses, completeResponses, surveyor]);

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

  const handleExportMenuOpen = (e) => setExportMenuAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportMenuAnchor(null);

  const downloadResponseFiles = () => {
    setFetching(true);
    surveyService
      .downloadResponseFiles(surveyId)
      .then((data) => {
        if (data) {
          const file = new File([data], `${surveyId}-response-files.zip`, {
            type: "application/zip",
          });
          FileSaver.saveAs(file);
        }
        setFetching(false);
      })
      .catch(processApirror);
  };

  const exportResponses = (format) => {
    setFetching(true);
    surveyService
      .exportResponses(
        surveyId,
        timezone,
        dbResponses,
        completeResponses,
        format
      )
      .then((data) => {
        if (data) {
          const map = {
            csv: { ext: "csv", type: "text/csv;charset=utf-8" },
            xlsx: {
              ext: "xlsx",
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
            ods: {
              ext: "ods",
              type: "application/vnd.oasis.opendocument.spreadsheet",
            },
          };
          const f = map[format];
          const file = new File(
            [data],
            `${surveyId}-responses-export.${f.ext}`,
            { type: f.type }
          );
          FileSaver.saveAs(file);
        }
        setFetching(false);
      })
      .catch(processApirror);
  };

  const handleExport = (format) => {
    handleExportMenuClose();
    if (format === "files") downloadResponseFiles();
    else exportResponses(format);
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
      <Dialog
        open={exportDlgOpen}
        onClose={() => setExportDlgOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("responses.export")}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Box display="flex" gap={2}>
            <TextField
              label="From"
              type="number"
              value={exportFrom}
              onChange={(e) => setExportFrom(Number(e.target.value))}
              inputProps={{ min: 1, max: allResponse?.totalCount || 1 }}
            />
            <TextField
              label="To"
              type="number"
              value={exportTo}
              onChange={(e) => setExportTo(Number(e.target.value))}
              inputProps={{ min: 1, max: allResponse?.totalCount || 1 }}
            />
          </Box>
          <FormControl>
            <FormLabel>Responses Type</FormLabel>

            <RadioGroup
              row
              value={exportFilter}
              onChange={(e) => setExportFilter(e.target.value)}
            >
              <FormControlLabel value="all" control={<Radio />} label="All" />
              <FormControlLabel
                value="complete"
                control={<Radio />}
                label="Completed"
              />
              <FormControlLabel
                value="incomplete"
                control={<Radio />}
                label="Incomplete"
              />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Export Format</FormLabel>

            <RadioGroup
              row
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel
                value="xlsx"
                control={<Radio />}
                label="Excel"
              />
              <FormControlLabel value="ods" control={<Radio />} label="ODS" />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Mode</FormLabel>

            <RadioGroup
              row
              value={exportMode}
              onChange={(e) => setExportMode(e.target.value)}
            >
              <FormControlLabel
                value="database"
                control={<Radio />}
                label="Database Format"
              />
              <FormControlLabel
                value="text"
                control={<Radio />}
                label="Text Format"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDlgOpen(false)}>
            {t("action_btn.cancel")}
          </Button>
          <Button
            onClick={() => {
              setExportDlgOpen(false);
              exportResponses(exportFormat, {
                from: exportFrom,
                to: exportTo,
                filter: exportFilter,
                mode: exportMode,
              });
            }}
            variant="contained"
          >
            {t("action_btn.export")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={downloadDlgOpen}
        onClose={() => setDownloadDlgOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("responses.download_dialog_title") || "Download Response Files"}
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Box display="flex" gap={2}>
            <TextField
              label="From"
              type="number"
              value={downloadFrom}
              onChange={(e) => setDownloadFrom(Number(e.target.value))}
              inputProps={{ min: 1, max: allResponse?.totalCount || 1 }}
            />
            <TextField
              label="To"
              type="number"
              value={downloadTo}
              onChange={(e) => setDownloadTo(Number(e.target.value))}
              inputProps={{ min: 1, max: allResponse?.totalCount || 1 }}
            />
          </Box>

          <RadioGroup
            value={downloadFilter}
            row
            onChange={(e) => setDownloadFilter(e.target.value)}
          >
            <FormControlLabel value="all" control={<Radio />} label="All" />
            <FormControlLabel
              value="complete"
              control={<Radio />}
              label="Completed"
            />
            <FormControlLabel
              value="incomplete"
              control={<Radio />}
              label="Incomplete"
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDlgOpen(false)}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={() => {
              setDownloadDlgOpen(false);
              downloadResponseFiles({
                from: downloadFrom,
                to: downloadTo,
                filter: downloadFilter,
              });
            }}
            variant="contained"
          >
            {t("common.download") || "Download"}
          </Button>
        </DialogActions>
      </Dialog>

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
                    const isSelected = selected && selected.id === r.id;
                    return (
                      <ListItemButton
                        key={r.id}
                        selected={isSelected}
                        onClick={() => setSelected(r)}
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
                  {t("responses.no_selection") || "Select a response"}
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
