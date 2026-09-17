"use client";
import { Loader } from "@/components/ui/loader";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppModal } from "@/components/ui/modal";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface SieveEditorModalProps {
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
  onValidate: (content: string) => Promise<{ isValid: boolean; errors?: string[] }>;
}

export function SieveEditorModal({
  content,
  onSave,
  onClose,
  onValidate,
}: SieveEditorModalProps) {
  const t = useTranslations("settings.filters.sieve_editor");
  const [script, setScript] = useState(content);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors?: string[];
  } | null>(null);
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = script.split("\n").length;

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await onValidate(script);
      setValidationResult(result);
    } catch {
      setValidationResult({ isValid: false, errors: [t("validation_failed")] });
    } finally {
      setIsValidating(false);
    }
  }, [script, onValidate, t]);

  const handleSave = useCallback(() => {
    if (!showSaveWarning) {
      setShowSaveWarning(true);
      return;
    }
    onSave(script);
  }, [script, showSaveWarning, onSave]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setScript(script.substring(0, start) + "  " + script.substring(end));
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  return (
    <AppModal
      isOpen
      onClose={onClose}
      size="full"
      className="max-w-4xl max-h-[90vh] flex flex-col"
      title={t("title")}
      bodyClassName="px-6 py-4 flex-1 overflow-hidden flex flex-col space-y-4"
      footer={(
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isValidating || !script.trim()}
          >
            {isValidating ? (
              <>
                <Loader size="sm" color="current" className="me-2" />
                {t("validating")}
              </>
            ) : (
              t("validate")
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!script.trim()}>
              {showSaveWarning ? t("confirm_save") : t("save")}
            </Button>
          </div>
        </div>
      )}
    >
      <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/20 text-sm text-warning">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{t("warning")}</p>
      </div>

      <div className="flex-1 min-h-0 flex border border-border rounded-md overflow-hidden">
        <div
          className="w-10 flex-shrink-0 bg-muted border-e border-border py-2 text-end pe-2 select-none overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground leading-[1.5rem]"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <Textarea
          ref={textareaRef}
          value={script}
          onChange={(e) => {
            setScript(e.target.value);
            setValidationResult(null);
            setShowSaveWarning(false);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-0 rounded-none border-0 font-mono text-sm p-2 resize-none leading-[1.5rem] focus-visible:ring-0"
          spellCheck={false}
          aria-label={t("script_content")}
        />
      </div>

      {validationResult && (
        <div
          className={`flex items-start gap-2 p-3 rounded-md text-sm ${
            validationResult.isValid
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          {validationResult.isValid ? (
            <>
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{t("valid")}</p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t("invalid")}</p>
                {validationResult.errors?.map((err, i) => (
                  <p key={i} className="mt-1 font-mono text-xs">
                    {err}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showSaveWarning && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/20 text-sm text-warning">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t("save_warning")}</p>
        </div>
      )}
    </AppModal>
  );
}
