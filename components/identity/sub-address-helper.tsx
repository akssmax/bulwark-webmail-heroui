'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover } from '@/components/ui/popover';
import { useIdentityStore } from '@/stores/identity-store';
import { useSettingsStore } from '@/stores/settings-store';
import {
  generateSubAddress,
  extractDomain,
  suggestTagsForDomain,
  getTagValidationError,
  MAX_TAG_LENGTH,
} from '@/lib/sub-addressing';

interface SubAddressHelperProps {
  baseEmail: string;
  recipientEmails: string[];
  onSelectTag: (tag: string) => void;
  disabled?: boolean;
}

export function SubAddressHelper({
  baseEmail,
  recipientEmails,
  onSelectTag,
  disabled = false,
}: SubAddressHelperProps) {
  const t = useTranslations('identities.sub_address');
  const [isOpen, setIsOpen] = useState(false);
  const [tag, setTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { subAddress, addRecentTag, addTagSuggestion } = useIdentityStore();
  const subAddressDelimiter = useSettingsStore((state) => state.subAddressDelimiter);

  const suggestions = useMemo(() => {
    return recipientEmails
      .map(extractDomain)
      .filter(Boolean)
      .flatMap((domain) => suggestTagsForDomain(domain!))
      .filter((tag, index, self) => self.indexOf(tag) === index)
      .slice(0, 5);
  }, [recipientEmails]);

  const preview = tag ? generateSubAddress(baseEmail, tag, subAddressDelimiter) : baseEmail;

  const handleTagChange = (value: string) => {
    setTag(value);
    const errorCode = getTagValidationError(value);

    let errorMessage: string | null = null;
    if (errorCode === 'EMPTY') {
      errorMessage = t('validation.empty');
    } else if (errorCode === 'TOO_LONG') {
      errorMessage = t('validation.too_long', { max: MAX_TAG_LENGTH });
    } else if (errorCode === 'INVALID_CHARS') {
      errorMessage = t('validation.invalid_chars');
    }

    setError(errorMessage);
  };

  const handleSelectTag = (selectedTag: string) => {
    const errorCode = getTagValidationError(selectedTag);
    if (errorCode) {
      let errorMessage: string | null = null;
      if (errorCode === 'EMPTY') {
        errorMessage = t('validation.empty');
      } else if (errorCode === 'TOO_LONG') {
        errorMessage = t('validation.too_long', { max: MAX_TAG_LENGTH });
      } else if (errorCode === 'INVALID_CHARS') {
        errorMessage = t('validation.invalid_chars');
      }
      setError(errorMessage);
      return;
    }

    addRecentTag(selectedTag);
    const domain = recipientEmails.map(extractDomain).find(Boolean);
    if (domain) {
      addTagSuggestion(domain, selectedTag);
    }

    onSelectTag(selectedTag);
    setIsOpen(false);
    setTag('');
    setError(null);
  };

  const handleUseAddress = () => {
    if (!tag) return;
    handleSelectTag(tag);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          title={t('button_tooltip')}
          className="h-8 px-2"
        >
          <Plus className="w-4 h-4 me-1" />
          <Tag className="w-4 h-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-80 p-4" placement="bottom end">
        <Popover.Dialog>
          <Popover.Heading className="text-sm font-semibold text-foreground mb-3">
            {t('popover_title')}
          </Popover.Heading>

          <div className="mb-3">
            <Input
              type="text"
              value={tag}
              onChange={(e) => handleTagChange(e.target.value)}
              placeholder={t('tag_input_placeholder')}
              className={cn(error && 'border-destructive')}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tag && !error) {
                  e.preventDefault();
                  handleUseAddress();
                }
              }}
            />
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>

          <div className="mb-3 p-2 bg-muted rounded text-sm">
            <div className="text-xs text-muted-foreground mb-1">
              {t('preview_label')}
            </div>
            <div className="font-mono text-foreground break-all">
              {preview}
            </div>
          </div>

          {subAddress.recentTags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-2">
                {t('recent_tags')}
              </div>
              <div className="flex flex-wrap gap-1">
                {subAddress.recentTags.slice(0, 5).map((recentTag) => (
                  <Button
                    key={recentTag}
                    variant="secondary"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={() => handleSelectTag(recentTag)}
                  >
                    {recentTag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-2">
                {t('suggested_tags')}
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs text-primary border-primary/20 bg-primary/10 hover:bg-primary/20"
                    onClick={() => handleSelectTag(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 text-xs text-muted-foreground">
            {t('help_text', { delimiter: subAddressDelimiter })}
          </div>

          <Button
            onClick={handleUseAddress}
            disabled={!tag || !!error}
            className="w-full"
            size="sm"
          >
            {t('use_address')}
          </Button>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
