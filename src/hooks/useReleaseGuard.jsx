import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { useBoolean } from "~/hooks/use-boolean";
import { useIsReleased } from "~/hooks/useIsReleased";
import ConfirmActionModal from "~/components/common/ConfirmActionModal";

const DEFAULT_MESSAGE_KEY = "released_warning";

// Guards a destructive design action behind a confirmation modal, but only when
// the survey is released. When not released, the action runs immediately so the
// editor keeps its usual frictionless behavior.
//
// Usage:
//   const { released, guard, modal, pending } = useReleaseGuard();
//   <Btn onClick={() => guard(() => dispatch(removeAnswer(code)),
//                            { messageKey: "released_delete_option" })} />
//   {modal}
export function useReleaseGuard() {
  const released = useIsReleased();
  const { t } = useTranslation(NAMESPACES.DESIGN_CORE);
  const open = useBoolean(false);
  const pendingConfirm = useRef(null);
  const pendingCancel = useRef(null);
  const [messageKey, setMessageKey] = useState(DEFAULT_MESSAGE_KEY);

  const guard = useCallback(
    (action, opts = {}) => {
      if (!released) {
        action();
        return;
      }
      pendingConfirm.current = action;
      pendingCancel.current = opts.onCancel || null;
      setMessageKey(opts.messageKey || DEFAULT_MESSAGE_KEY);
      open.onTrue();
    },
    [released, open]
  );

  const onClose = useCallback(() => {
    const cancel = pendingCancel.current;
    pendingConfirm.current = null;
    pendingCancel.current = null;
    open.onFalse();
    cancel?.();
  }, [open]);

  const onConfirm = useCallback(() => {
    const confirm = pendingConfirm.current;
    pendingConfirm.current = null;
    pendingCancel.current = null;
    open.onFalse();
    confirm?.();
  }, [open]);

  const modal = (
    <ConfirmActionModal
      open={open.value}
      title={t("released_warning_title")}
      description={t(messageKey)}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirm")}
      confirmColor="error"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );

  return { released, guard, modal, pending: open.value };
}
