'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Star, FileText } from 'lucide-react';
import { SearchField } from '@/components/ui/search-field';
import { Button } from '@/components/ui/button';
import { AppModal } from '@/components/ui/modal';
import { useTemplateStore } from '@/stores/template-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  getPlaceholdersFromTemplate,
  getAutoFilledPlaceholders,
} from '@/lib/template-utils';
import { PlaceholderFillModal } from './placeholder-fill-modal';
import type { EmailTemplate } from '@/lib/template-types';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: EmailTemplate, filledValues: Record<string, string>) => void;
}

export function TemplatePicker({ isOpen, onClose, onSelect }: TemplatePickerProps) {
  const t = useTranslations('templates');
  const locale = useLocale();

  const { templates, getFavorites, getRecent, getTemplatesByCategory, searchTemplates, recordUsage } =
    useTemplateStore();
  const { primaryIdentity } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showFillModal, setShowFillModal] = useState(false);

  const favorites = getFavorites();
  const recent = getRecent();
  const byCategory = getTemplatesByCategory();
  const filtered = searchQuery ? searchTemplates(searchQuery) : null;

  const handleSelectTemplate = (template: EmailTemplate) => {
    const placeholders = getPlaceholdersFromTemplate(template);
    recordUsage(template.id);

    if (placeholders.length > 0) {
      setSelectedTemplate(template);
      setShowFillModal(true);
    } else {
      onSelect(template, {});
    }
  };

  const finishSelection = (values: Record<string, string>) => {
    if (selectedTemplate) {
      onSelect(selectedTemplate, values);
    }
    setShowFillModal(false);
    setSelectedTemplate(null);
  };

  const autoFilled = getAutoFilledPlaceholders({
    senderName: primaryIdentity?.name,
    locale,
  });

  const renderTemplateItem = (template: EmailTemplate) => (
    <Button
      key={template.id}
      variant="ghost"
      className="w-full justify-start h-auto p-3 rounded-md hover:bg-muted"
      onClick={() => handleSelectTemplate(template)}
    >
      <div className="w-full text-start">
        <div className="flex items-center gap-2">
          {template.isFavorite && (
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground truncate">
            {template.name}
          </span>
          {template.category && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
              {template.category}
            </span>
          )}
        </div>
        {template.subject && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {template.subject}
          </p>
        )}
      </div>
    </Button>
  );

  const renderSection = (title: string, items: EmailTemplate[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">
          {title}
        </h3>
        <div className="space-y-0.5">{items.map(renderTemplateItem)}</div>
      </div>
    );
  };

  const categorizedEntries = Object.entries(byCategory).filter(
    ([cat]) => cat !== ''
  );
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const recentFiltered = recent.filter((r) => !favoriteIds.has(r.id));
  const shownIds = new Set([
    ...favoriteIds,
    ...recentFiltered.map((r) => r.id),
  ]);
  const uncategorizedFiltered = (byCategory[''] || []).filter(
    (i) => !shownIds.has(i.id)
  );

  return (
    <>
      <AppModal
        isOpen={isOpen && !showFillModal}
        onClose={onClose}
        size="md"
        className="max-w-md max-h-[70vh]"
        title={t('picker_title')}
        bodyClassName="overflow-y-auto max-h-[calc(70vh-120px)] p-2"
      >
        <div className="px-2 pb-2 border-b border-border mb-2">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
            inputClassName="h-9"
            autoFocus
          />
        </div>

        {templates.length === 0 && (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">{t('no_templates')}</p>
          </div>
        )}

        {filtered ? (
          filtered.length > 0 ? (
            <div className="space-y-0.5">
              {filtered.map(renderTemplateItem)}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('no_results')}
            </div>
          )
        ) : (
          <>
            {renderSection(t('section_favorites'), favorites)}
            {renderSection(t('section_recent'), recentFiltered)}
            {categorizedEntries.map(([cat, items]) =>
              renderSection(
                cat,
                items.filter((i) => !shownIds.has(i.id))
              )
            )}
            {renderSection(t('section_uncategorized'), uncategorizedFiltered)}
          </>
        )}
      </AppModal>

      {showFillModal && selectedTemplate && (
        <PlaceholderFillModal
          template={selectedTemplate}
          placeholders={getPlaceholdersFromTemplate(selectedTemplate)}
          autoFilled={autoFilled}
          onConfirm={finishSelection}
          onSkip={() => finishSelection({})}
          onClose={() => {
            setShowFillModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </>
  );
}
