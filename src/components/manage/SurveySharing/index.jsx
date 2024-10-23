import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from "react-share";
import SuccessSnackbar from "~/components/manage/SuccessSnackbar";
import { sharingUrl } from "~/networking/common";
import styles from "./SurveySharing.module.css";
import { useSelector } from "react-redux";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import QRCode from "react-qr-code";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@emotion/react";

function SurveySharing() {
  const qrRef = useRef();
  const theme = useTheme();
  const { t } = useTranslation("manage");
  const survey = useSelector((state) => state.editState.survey);
  const url = sharingUrl(survey?.id);
  const [isQRDialogOpen, setQRDialogOpen] = useState(false);

  const [copy, setCopy] = useState(false);

  const clickCopy = () => {
    navigator.clipboard.writeText(url);
    setCopy(true);
  };
  const toggleQRDialog = () => {
    setQRDialogOpen(!isQRDialogOpen);
  };

  const downloadQRCode = () => {
    const canvas = document.createElement("canvas");
    const qrCodeSVG = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(blobURL);
      const canvasDataURL = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = canvasDataURL;
      a.download = `${survey?.name}_QRCode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    image.src = blobURL;
  };

  const mailSurveyLink = `mailto:?subject=Survey Link&body=Please complete this survey: ${encodeURIComponent(
    url
  )}`;

  return (
    <>
      <Box className={styles.mainContainer}>
        {copy && (
          <SuccessSnackbar
            handleClose={() => setCopy(false)}
            success="copied"
            left="56"
          />
        )}
        <Box className={styles.defaultUrl}>
          <a className={styles.urlLink} href={url}>
            {url.slice(0, 50)}...{url.slice(-10)}
          </a>
        </Box>
        <Box className={styles.buttonContainer} display="flex" gap={2}>
          <Button
            fullWidth
            onClick={toggleQRDialog}
            className={styles.actionButton}
          >
            <SurveyIcon name="qrCode" />
            {t("launch.qr_code")}

          </Button>
          <a
            href={mailSurveyLink}
            style={{
              color: theme.palette.primary.main,
              width: "100%",
              textDecoration: "none",
            }}
          >
            <Button fullWidth className={styles.actionButton}>
              <SurveyIcon name="email" />
              {t("launch.email_link")}
            </Button>
          </a>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={styles.copyButton}
            onClick={clickCopy}
          >
            <SurveyIcon name="duplicate" color="#fff" />
            {t("launch.copy_link")}
          </Button>
        </Box>

        <Box className={styles.socialSharing}>
          <Box className={styles.socialLink}>
            <FacebookShareButton url={url}>
              <FacebookIcon className={styles.iconShareFb} />
            </FacebookShareButton>
            <TwitterShareButton url={url}>
              <TwitterIcon className={styles.iconShareTw} />
            </TwitterShareButton>
            <LinkedinShareButton url={url}>
              <LinkedInIcon className={styles.iconShareLn} />
            </LinkedinShareButton>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={isQRDialogOpen}
        onClose={toggleQRDialog}
        sx={{ "& .MuiDialog-paper": { padding: "2rem", position: "relative" } }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <IconButton
            aria-label="close"
            onClick={toggleQRDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div ref={qrRef}>
            <QRCode value={url} size={256} />
          </div>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={downloadQRCode}
            sx={{ mt: 2 }}
          >
            Download QR Code
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SurveySharing;
