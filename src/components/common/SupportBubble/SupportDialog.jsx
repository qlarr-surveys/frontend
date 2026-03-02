import React, { useMemo, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Stack,
  Link,
  Alert,
  Collapse,
  Grow,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckIcon from "@mui/icons-material/Check";
import Iconify from "~/components/iconify";
import SendIcon from "~/assets/icons/send.svg";
import ThankYouShape from "~/assets/icons/thankyou-shape.svg";
import FormProvider, { RHFTextField } from "~/components/hook-form";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { getDirFromSession } from "~/utils/common";
import publicApi from "~/services/publicApi";
import styles from "./SupportBubble.module.css";

const SupportDialog = ({ open, onClose }) => {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const [fullScreen, setFullScreen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const isRtl = getDirFromSession() === "rtl";

  const SupportSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required(t("support_bubble.name_required")),
        email: Yup.string()
          .required(t("support_bubble.email_required"))
          .matches(
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
            t("support_bubble.invalid_email")
          ),
        message: Yup.string().required(t("support_bubble.message_required")),
      }),
    [t]
  );

  const methods = useForm({
    resolver: yupResolver(SupportSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await publicApi.post("/support/contact", data);
      setSubmitStatus("success");
      reset();
    } catch (error) {
      setSubmitStatus("error");
    }
  });

  const handleClose = () => {
    setSubmitStatus(null);
    setFullScreen(false);
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <Grow in={open} style={{ transformOrigin: isRtl ? "left bottom" : "right bottom" }}>
        <Paper
          elevation={8}
          className={`${styles.dialog} ${fullScreen ? styles.dialogFullScreen : styles.dialogDefault}`}
          sx={!fullScreen ? (isRtl ? { left: 24 } : { right: 24 }) : undefined}
        >
          {/* Header */}
          <Box className={styles.header}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box className={styles.headerIcon}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
                {t("support_bubble.title")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setFullScreen((prev) => !prev)}
                sx={{ color: "#fff" }}
              >
                <Iconify
                  icon={fullScreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"}
                  width={20}
                />
              </IconButton>
              <IconButton size="small" onClick={handleClose} sx={{ color: "#fff" }}>
                <Iconify icon="mdi:close" width={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Body */}
          <Box className={styles.body}>
            {submitStatus === "success" ? (
              <Box className={styles.successView}>
                <Box className={styles.successIcon}>
                  <img src={ThankYouShape} alt="" width={85.03} height={85.02} style={{ position: "absolute" }} />
                  <CheckIcon sx={{ fontSize: 36, color: "#16205B", position: "relative" }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#16205B",
                    whiteSpace: "pre-line",
                    mb: "44px",
                  }}
                >
                  {t("support_bubble.success_title")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#314158" }}>
                  {t("support_bubble.success_subtitle")}
                </Typography>
              </Box>
            ) : (
              <div style={{ padding: "24px" }}>
                <Typography variant="body2" sx={{ mb: 2, color: "#314158" }}>
                  {t("support_bubble.description")}
                </Typography>

                <Collapse in={submitStatus === "error"}>
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setSubmitStatus(null)}
                  >
                    {t("support_bubble.error_message")}
                  </Alert>
                </Collapse>

                <FormProvider methods={methods} onSubmit={onSubmit}>
                  <Stack spacing={2.5}>
                    <Box className={styles.formArea}>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography
                            component="label"
                            htmlFor="name"
                            variant="subtitle2"
                            className={styles.label}
                            sx={{ mb: "8px", display: "block" }}
                          >
                            {t("support_bubble.name_label")}
                          </Typography>
                          <RHFTextField
                            name="name"
                            id="name"
                            placeholder={t("support_bubble.name_placeholder")}
                            size="small"
                            className={styles.textField}
                          />
                        </Box>
                        <Box>
                          <Typography
                            component="label"
                            htmlFor="email"
                            variant="subtitle2"
                            className={styles.label}
                            sx={{ mb: "8px", display: "block" }}
                          >
                            {t("support_bubble.email_label")}
                          </Typography>
                          <RHFTextField
                            name="email"
                            id="email"
                            placeholder={t("support_bubble.email_placeholder")}
                            size="small"
                            className={styles.textField}
                          />
                        </Box>
                        <Box>
                          <Typography
                            component="label"
                            htmlFor="message"
                            variant="subtitle2"
                            className={styles.label}
                            sx={{ mb: "8px", display: "block" }}
                          >
                            {t("support_bubble.message_label")}
                          </Typography>
                          <RHFTextField
                            name="message"
                            id="message"
                            placeholder={t("support_bubble.message_placeholder")}
                            multiline
                            rows={4}
                            size="small"
                            className={styles.textField}
                          />
                        </Box>
                      </Stack>
                    </Box>

                    <LoadingButton
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                      startIcon={<img src={SendIcon} alt="" width={18} height={18} />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #04bdf3 0%, #2d9ed9 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #039dd4 0%, #2588bf 100%)",
                        },
                        borderRadius: "8px",
                        py: 1.2,
                        textTransform: "none",
                        fontSize: "1rem",
                        width: "214px",
                        alignSelf: "center",
                      }}
                    >
                      {t("support_bubble.send_button")}
                    </LoadingButton>
                  </Stack>
                </FormProvider>
              </div>
            )}

            {/* Footer */}
            <Box className={styles.footer}>
              <Typography variant="caption" className={styles.footerText}>
                <Iconify color="#45556C" icon="mdi:email-outline" width={16} />
                {t("support_bubble.prefer_email")}{" "}
                <Link sx={{ color: "#04BDF3" }} href="mailto:support@qlarr.com" underline="always">
                  {t("support_bubble.support_email")}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grow>
  );
};

export default SupportDialog;
