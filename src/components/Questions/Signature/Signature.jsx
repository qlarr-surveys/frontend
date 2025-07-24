import { Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import SignatureCanvas from "react-signature-canvas";
import { useService } from "~/hooks/use-service";
import {
  downloadFileAsBase64,
  previewUrlByFilename,
  uploadDataUrl,
} from "~/networking/run";
import { valueChange } from "~/state/runState";
import styles from "./Signature.module.css";

function Signature(props) {
  const runService = useService("run");

  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [clearEnabled, setClearEnabled] = useState(false);
  const [signature, setSignature] = useState(undefined);

  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    return questionState?.value;
  });

  const containerRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(400);
  useEffect(() => {
    setCanvasWidth(containerRef?.current?.offsetWidth);
  }, [containerRef]);

  useEffect(() => {
    const resizeListener = () => {
      // change width from the state object
      setCanvasWidth(containerRef?.current?.offsetWidth);
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const preview = useSelector((state) => {
    return state.runState.preview;
  });

  const sigCanvas = useRef();
  const dispatch = useDispatch();

  const clear = () => {
    sigCanvas.current?.clear();
    setSignature(undefined);
    setClearEnabled(false);
    setSubmitEnabled(false);
  };
  const submit = () => {
    const dataUrl = sigCanvas.current.toDataURL("image/png");
    uploadDataUrl(
      runService,
      props.component.qualifiedCode,
      preview,
      dataUrl,
      `signature.png`
    )
      .then((response) => {
        dispatch(
          valueChange({
            componentCode: props.component.qualifiedCode,
            value: response,
          })
        );
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (state && state.stored_filename) {
      setClearEnabled(true);
      downloadFileAsBase64(previewUrlByFilename(state.stored_filename)).then(
        (response) => {
          setSubmitEnabled(false);
          setSignature(response);
        }
      );
    }
  }, [state]);

  return (
    <>
      <Box
        sx={{ backgroundColor: "background.default" }}
        className={styles.container}
      >
        <Box
          ref={containerRef}
          sx={{ maxWidth: Math.min(canvasWidth, 400) + "px" }}
          className={styles.signatureCanvas}
        >
          {signature ? (
            <img
              src={signature}
              style={{
                width: Math.min(canvasWidth, 400) + "px",
                height: "200px",
              }}
            />
          ) : (
            <SignatureCanvas
              penColor="red"
              clearOnResize={true}
              onBegin={() => {
                setSubmitEnabled(true);
                setClearEnabled(true);
              }}
              ref={sigCanvas}
              canvasProps={{ width: Math.min(canvasWidth, 400), height: 200 }}
            />
          )}
        </Box>
      </Box>
      <br />

      <div className={styles.buttonContainer}>
        <Button onClick={() => clear()} disabled={!clearEnabled}>
          Clear
        </Button>
        <Button onClick={() => submit()} disabled={!submitEnabled}>
          Submit
        </Button>
      </div>
    </>
  );
}

export default Signature;
