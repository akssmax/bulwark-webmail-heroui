"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export function PromptDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder,
  defaultValue = "",
  confirmText,
  cancelText,
}: PromptDialogProps) {
  const t = useTranslations("confirm_dialog");
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValue]);

  const resolvedConfirmText = confirmText || t("confirm");
  const resolvedCancelText = cancelText || t("cancel");
  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    try {
      onSubmit(trimmed);
    } finally {
      onClose();
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Container size="sm">
        <Modal.Dialog aria-labelledby={`${id}-title`}>
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading id={`${id}-title`}>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <Input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="mt-2"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="outline" onClick={onClose}>
                {resolvedCancelText}
              </Button>
              <Button type="submit" variant="default" disabled={!canSubmit}>
                {resolvedConfirmText}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
