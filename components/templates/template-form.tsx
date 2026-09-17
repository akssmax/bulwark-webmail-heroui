'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppSelect } from '@/components/ui/select';
import { Dropdown } from '@/components/ui/dropdown';
import { Star, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { validateTemplateName } from '@/lib/template-utils';
import { BUILT_IN_PLACEHOLDERS } from '@/lib/template-types';
import type { EmailTemplate } from '@/lib/template-types';
import { useTemplateStore } from '@/stores/template-store';
import { useAuthStore } from '@/stores/auth-store';


interface TemplateFormProps {
  template?: EmailTemplate;
  initialData?: {
    subject?: string;
    body?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
  };
  onSave: (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function TemplateForm({ template, initialData, onSave, onCancel }: TemplateFormProps) {
  const t = useTranslations('templates');
  const tSettings = useTranslations('settings.templates');
  const tComposer = useTranslations('email_composer');

  const { identities } = useAuthStore();
  const templates = useTemplateStore((s) => s.templates);

  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState(template?.category || '');
  const [subject, setSubject] = useState(template?.subject || initialData?.subject || '');
  const [body, setBody] = useState(template?.body || initialData?.body || '');
  const [isHTML, setIsHTML] = useState(template?.isHTML || false);
  const [toRecipients, setToRecipients] = useState(
    template?.defaultRecipients?.to?.join(', ') || initialData?.to?.join(', ') || ''
  );
  const [ccRecipients, setCcRecipients] = useState(
    template?.defaultRecipients?.cc?.join(', ') || initialData?.cc?.join(', ') || ''
  );
  const [bccRecipients, setBccRecipients] = useState(
    template?.defaultRecipients?.bcc?.join(', ') || initialData?.bcc?.join(', ') || ''
  );
  const [identityId, setIdentityId] = useState(template?.identityId || '');
  const [isFavorite, setIsFavorite] = useState(template?.isFavorite || false);
  const [nameError, setNameError] = useState<string | null>(null);

  const existingCategories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [templates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateTemplateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    const parseRecipients = (val: string) =>
      val.split(',').map((s) => s.trim()).filter(Boolean);

    const to = parseRecipients(toRecipients);
    const cc = parseRecipients(ccRecipients);
    const bcc = parseRecipients(bccRecipients);

    onSave({
      name: name.trim(),
      subject,
      body,
      isHTML,
      category: category.trim(),
      defaultRecipients: to.length || cc.length || bcc.length
        ? { to: to.length ? to : undefined, cc: cc.length ? cc : undefined, bcc: bcc.length ? bcc : undefined }
        : undefined,
      identityId: identityId || undefined,
      isFavorite,
    });
  };

  const insertPlaceholder = (placeholder: string, field: 'subject' | 'body') => {
    const tag = `{{${placeholder}}}`;
    if (field === 'subject') {
      setSubject((prev) => prev + tag);
    } else {
      setBody((prev) => prev + tag);
    }
  };

  const identityOptions = [
    { value: '', label: tSettings('default_identity') },
    ...identities.map((id) => ({
      value: id.id,
      label: id.name ? `${id.name} <${id.email}>` : id.email,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">{tSettings('name')}</label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(null); }}
          placeholder={tSettings('name_placeholder')}
          className={cn('mt-1', nameError && 'border-red-500')}
          autoFocus
        />
        {nameError && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {tSettings(`validation.${nameError}`)}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">{tSettings('category')}</label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={tSettings('category_placeholder')}
          className="mt-1"
          list="template-categories"
        />
        {existingCategories.length > 0 && (
          <datalist id="template-categories">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{tSettings('subject')}</label>
          <PlaceholderDropdown onSelect={(p) => insertPlaceholder(p, 'subject')} />
        </div>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={tSettings('subject_placeholder')}
          className="mt-1"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{tSettings('body')}</label>
          <PlaceholderDropdown onSelect={(p) => insertPlaceholder(p, 'body')} />
        </div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={tSettings('body_placeholder')}
          rows={6}
          className="mt-1 min-h-[120px] resize-y"
        />
        <Checkbox isSelected={isHTML} onChange={setIsHTML} className="text-sm text-muted-foreground">
          HTML
        </Checkbox>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground">{tComposer('to')}</label>
          <Input
            value={toRecipients}
            onChange={(e) => setToRecipients(e.target.value)}
            placeholder={tSettings('recipients_placeholder')}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">{tComposer('cc')}</label>
          <Input
            value={ccRecipients}
            onChange={(e) => setCcRecipients(e.target.value)}
            placeholder={tSettings('recipients_placeholder')}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">{tComposer('bcc')}</label>
          <Input
            value={bccRecipients}
            onChange={(e) => setBccRecipients(e.target.value)}
            placeholder={tSettings('recipients_placeholder')}
            className="mt-1"
          />
        </div>
      </div>

      {identities.length > 1 && (
        <div>
          <label className="text-sm font-medium text-foreground">{tSettings('identity')}</label>
          <AppSelect
            value={identityId}
            onChange={setIdentityId}
            options={identityOptions}
            className="mt-1"
            aria-label={tSettings('identity')}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFavorite(!isFavorite)}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Star className={cn('w-4 h-4', isFavorite && 'fill-amber-400 text-amber-400')} />
          {tSettings('favorite')}
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {tSettings('cancel')}
          </Button>
          <Button type="submit" size="sm">
            {template ? tSettings('update') : tSettings('create')}
          </Button>
        </div>
      </div>
    </form>
  );
}

function PlaceholderDropdown({ onSelect }: { onSelect: (name: string) => void }) {
  const t = useTranslations('templates');

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <Plus className="w-3 h-3 me-1" />
          {t('placeholder')}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-[180px]">
        <Dropdown.Menu aria-label={t('placeholder')}>
          {BUILT_IN_PLACEHOLDERS.map((p) => (
            <Dropdown.Item key={p} id={p} onAction={() => onSelect(p)}>
              <span className="font-mono text-xs text-primary">{`{{${p}}}`}</span>
              <span className="ms-2 text-muted-foreground">{t(`placeholders.${p}`)}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
