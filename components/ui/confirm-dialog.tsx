"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@heroui/react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "default",
}: ConfirmDialogProps) {
  const t = useTranslations("confirm_dialog");
  const id = useId();
  const resolvedConfirmText = confirmText || t("confirm");
  const resolvedCancelText = cancelText || t("cancel");

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Container size="sm">
        <Modal.Dialog aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}>
          <Modal.Header>
            {variant === "destructive" && (
              <Modal.Icon className="bg-danger/10 text-danger">
                <AlertTriangle className="w-5 h-5" />
              </Modal.Icon>
            )}
            <Modal.Heading id={`${id}-title`}>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p id={`${id}-message`} className="text-sm text-muted-foreground">
              {message}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline" onClick={onClose}>
              {resolvedCancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                try {
                  onConfirm();
                } finally {
                  onClose();
                }
              }}
            >
              {resolvedConfirmText}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
