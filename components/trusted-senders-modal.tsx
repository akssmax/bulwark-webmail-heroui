"use client";
import { Loader } from "@/components/ui/loader";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Search, Trash2, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useSettingsStore } from "@/stores/settings-store";
import { useContactStore } from "@/stores/contact-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { AppModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TrustedSendersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrustedSendersModal({ isOpen, onClose }: TrustedSendersModalProps) {
  const t = useTranslations("settings.email_behavior.trusted_senders");
  const inputRef = useRef<HTMLInputElement>(null);

  const { trustedSenders, addTrustedSender, removeTrustedSender, trustedSendersAddressBook } = useSettingsStore();
  const {
    trustedSenderEmails,
    trustedSendersLoaded,
    trustedSendersLoading,
    loadTrustedSendersBook,
    addToTrustedSendersBook,
    removeFromTrustedSendersBook,
  } = useContactStore();
  const { client } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && trustedSendersAddressBook && client && !trustedSendersLoaded) {
      loadTrustedSendersBook(client);
    }
  }, [isOpen, trustedSendersAddressBook, client, trustedSendersLoaded, loadTrustedSendersBook]);

  const activeSenders = trustedSendersAddressBook ? trustedSenderEmails : trustedSenders;
  const isLoading = trustedSendersAddressBook && (!trustedSendersLoaded || trustedSendersLoading);

  const filteredSenders = useMemo(() => {
    if (!searchQuery.trim()) return activeSenders;
    const query = searchQuery.toLowerCase();
    return activeSenders.filter((email) => email.toLowerCase().includes(query));
  }, [activeSenders, searchQuery]);

  const showSearch = activeSenders.length >= 5;

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setIsAdding(false);
      setNewEmail("");
      setEmailError("");
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddSender = async () => {
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError(t("invalid_email"));
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError(t("invalid_email"));
      return;
    }

    if (activeSenders.includes(trimmedEmail)) {
      setEmailError(t("already_added"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (trustedSendersAddressBook && client) {
        await addToTrustedSendersBook(client, trimmedEmail);
      } else {
        addTrustedSender(trimmedEmail);
      }
      setNewEmail("");
      setIsAdding(false);
      setEmailError("");
    } catch {
      setEmailError(t("save_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSender = async (email: string) => {
    if (trustedSendersAddressBook && client) {
      await removeFromTrustedSendersBook(client, email);
    } else {
      removeTrustedSender(email);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSender();
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="max-w-md max-h-[60vh] flex flex-col"
      bodyClassName="flex-1 overflow-y-auto p-0"
      header={(
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 id="trusted-senders-title" className="text-lg font-semibold text-foreground">
            {t("modal_title")}
          </h2>
        </div>
      )}
      footer={
        !isLoading && activeSenders.length > 0 ? (
          <div className="w-full px-6 py-4 border-t border-border flex-shrink-0">
            {isAdding ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="email"
                    placeholder={t("add_placeholder")}
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError("");
                    }}
                    onKeyDown={handleKeyDown}
                    className={cn("flex-1", emailError && "border-destructive")}
                  />
                  <Button
                    onClick={handleAddSender}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader size="sm" color="current" /> : t("add_button")}
                  </Button>
                </div>
                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4" />
                {t("add_manually")}
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {showSearch && (
        <div className="px-6 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size="md" color="current" />
        </div>
      ) : activeSenders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-base font-medium text-foreground mb-2">
            {t("empty_title")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
            {t("empty_description")}
          </p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 me-2" />
            {t("add_manually")}
          </Button>
        </div>
      ) : filteredSenders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {t("no_results")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredSenders.map((email) => (
            <div
              key={email}
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors group"
            >
              <Avatar email={email} size="sm" />
              <span className="flex-1 text-sm text-foreground truncate">
                {email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSender(email)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label={`${t("remove")} ${email}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppModal>
  );
}
