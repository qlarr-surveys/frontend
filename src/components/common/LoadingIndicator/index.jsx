import React from "react";
import Lottie from "react-lottie";
import styles from "./LoadingIndicator.module.css";
import { useSelector } from "react-redux";

export default function LoadingIndicator() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    path: "/loadingLottie.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className={styles.loading}>
      <div className={styles.loadingWrapper}>
        <Lottie options={defaultOptions} />
      </div>
    </div>
  );
}

export function StatefulLoadingIndicator() {
  const isLoading = useSelector((state) => {
    return state.editState.loading;
  });
  return isLoading ? <LoadingIndicator /> : <></>;
}
