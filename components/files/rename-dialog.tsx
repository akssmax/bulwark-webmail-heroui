"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppModal } from "@/components/ui/modal";

interface RenameDialogProps {
  currentName: string;
  title?: string;
  label?: string;
  onConfirm: (newName: string) => Promise<void>;
  onCancel: () => void;
}

export function RenameDialog({ currentName, title, label, onConfirm, onCancel }: RenameDialogProps) {
  const t = useTranslations("files");
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onConfirm(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen
      onClose={onCancel}
      title={title || t("rename_title")}
      size="sm"
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="rename-form" disabled={!name.trim() || isSubmitting}>
            {t("save")}
          </Button>
        </>
      )}
    >
      <form id="rename-form" onSubmit={handleSubmit}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={label || t("new_name")}
          aria-label={label || t("new_name")}
        />
      </form>
    </AppModal>
  );
}
