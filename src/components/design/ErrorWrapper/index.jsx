import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import ErrorLayout from "~/components/common/ErrorLayout";
import { onEditErrorSeen } from "~/state/edit/editState";

function ErrorWrapper() {
  const dispatch = useDispatch();

  const error = useSelector((state) => {
    return state.editState.error;
  });

  const setErrorSeen = () => {
    dispatch(onEditErrorSeen());
  };

  const handleRetry = () => {
    window.location.href = window.location.href;
  };

  return (
    error &&
    !error.seen && (
      <ErrorLayout
        onRetry={handleRetry}
        setErrorSeen={setErrorSeen}
        error={error}
      />
    )
  );
}

export default ErrorWrapper;
