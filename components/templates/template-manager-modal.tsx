'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Pencil, Trash2, Star, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/ui/search-field';
import { AppModal } from '@/components/ui/modal';
import { TemplateForm } from './template-form';
import { useTemplateStore } from '@/stores/template-store';
import type { EmailTemplate } from '@/lib/template-types';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateManagerModal({ isOpen, onClose }: TemplateManagerModalProps) {
  const t = useTranslations('templates');
  const tSettings = useTranslations('settings.templates');

  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleFavorite,
    searchTemplates,
  } = useTemplateStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery ? searchTemplates(searchQuery) : templates;

  const handleSave = (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingId) {
      updateTemplate(editingId, data);
      setEditingId(null);
    } else {
      addTemplate(data);
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setDeleteConfirmId(null);
  };

  const handleClose = () => {
    if (isCreating || editingId) {
      setIsCreating(false);
      setEditingId(null);
    } else {
      onClose();
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      className="max-w-3xl max-h-[90vh]"
      bodyClassName="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
      header={(
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h2 id="template-manager-title" className="text-lg font-semibold text-foreground">
            {tSettings('title')}
          </h2>
        </div>
      )}
    >
      {!isCreating && !editingId && (
        <div className="flex items-center gap-3 mb-4">
          <SearchField
            className="flex-1"
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
          />
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
          >
            {tSettings('add')}
          </Button>
        </div>
      )}

      {isCreating && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
          <h3 className="text-sm font-semibold mb-4">{tSettings('add')}</h3>
          <TemplateForm
            onSave={handleSave}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {editingId && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
          <h3 className="text-sm font-semibold mb-4">{tSettings('edit')}</h3>
          <TemplateForm
            template={templates.find((t) => t.id === editingId)}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
              onClick={() => toggleFavorite(template.id)}
            >
              <Star
                className={cn(
                  'w-4 h-4 transition-colors',
                  template.isFavorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground hover:text-amber-400'
                )}
              />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {template.name}
                </p>
                {template.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                    {template.category}
                  </span>
                )}
              </div>
              {template.subject && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {template.subject}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setEditingId(template.id); setIsCreating(false); }}
                disabled={!!editingId || isCreating}
                className="h-8 w-8"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => duplicateTemplate(template.id, t('copy_suffix'))}
                disabled={!!editingId || isCreating}
                className="h-8 w-8"
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              {deleteConfirmId === template.id ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="h-7 text-xs"
                  >
                    {tSettings('confirm_delete')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(null)}
                    className="h-7 text-xs"
                  >
                    {tSettings('cancel')}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteConfirmId(template.id)}
                  disabled={!!editingId || isCreating}
                  className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && !isCreating && (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">
              {searchQuery ? t('no_results') : tSettings('no_templates')}
            </p>
          </div>
        )}
      </div>
    </AppModal>
  );
}
