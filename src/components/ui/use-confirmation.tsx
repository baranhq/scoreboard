"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "./ui";

export type ConfirmationChoice = "confirm" | "secondary" | "cancel";

type ConfirmationRequest = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  secondaryLabel?: string;
};

type ConfirmationOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  secondaryLabel?: string;
};

export function useConfirmation(labels: {
  confirmationTitle: string;
  cancel: string;
  continue: string;
  close: string;
}) {
  const [request, setRequest] = useState<ConfirmationRequest | null>(null);
  const resolveRequest = useRef<((choice: ConfirmationChoice) => void) | null>(null);
  const choice = useRef<ConfirmationChoice>("cancel");

  const confirm = useCallback(
    (message: string, options: ConfirmationOptions = {}) => {
      if (resolveRequest.current) return Promise.resolve<ConfirmationChoice>("cancel");

      return new Promise<ConfirmationChoice>((resolve) => {
        resolveRequest.current = resolve;
        choice.current = "cancel";
        setRequest({
          message,
          confirmLabel: options.confirmLabel || labels.continue,
          cancelLabel: options.cancelLabel || labels.cancel,
          secondaryLabel: options.secondaryLabel,
        });
      });
    },
    [labels.cancel, labels.continue],
  );

  const close = useCallback(() => {
    const resolve = resolveRequest.current;
    resolveRequest.current = null;
    setRequest(null);
    resolve?.(choice.current);
    choice.current = "cancel";
  }, []);

  useEffect(
    () => () => {
      resolveRequest.current?.("cancel");
      resolveRequest.current = null;
    },
    [],
  );

  const dialog = request ? (
    <Modal
      title={labels.confirmationTitle}
      close={close}
      closeLabel={labels.close}
      footerActions={[
        { id: "cancel", label: request.cancelLabel, autoFocus: true },
        ...(request.secondaryLabel
          ? [
              {
                id: "secondary",
                label: request.secondaryLabel,
                className:
                  "border-red-700/30 text-red-800 hover:border-red-700/50 hover:bg-red-700/5 dark:text-red-300",
              },
            ]
          : []),
        { id: "confirm", label: request.confirmLabel, primary: true },
      ]}
      onAction={(id) => {
        if (id === "confirm" || id === "secondary" || id === "cancel") choice.current = id;
      }}
    >
      <p className="text-base leading-relaxed whitespace-pre-line text-ink/85">{request.message}</p>
    </Modal>
  ) : null;

  return { confirm, dialog };
}
