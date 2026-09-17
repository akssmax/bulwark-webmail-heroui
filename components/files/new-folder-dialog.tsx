"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppModal } from "@/components/ui/modal";

interface NewFolderDialogProps {
  onConfirm: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function NewFolderDialog({ onConfirm, onCancel }: NewFolderDialogProps) {
  const t = useTranslations("files");
  const [name, setName] = useState("");
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
      title={t("new_folder")}
      size="sm"
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="new-folder-form" disabled={!name.trim() || isSubmitting}>
            {t("create")}
          </Button>
        </>
      )}
    >
      <form id="new-folder-form" onSubmit={handleSubmit}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("new_folder_name")}
          aria-label={t("new_folder_name")}
        />
      </form>
    </AppModal>
  );
}
