'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppModal } from '@/components/ui/modal';
import { substitutePlaceholders, isBuiltInPlaceholder } from '@/lib/template-utils';
import type { EmailTemplate } from '@/lib/template-types';

interface PlaceholderFillModalProps {
  template: EmailTemplate;
  placeholders: string[];
  autoFilled: Record<string, string>;
  onConfirm: (values: Record<string, string>) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function PlaceholderFillModal({
  template,
  placeholders,
  autoFilled,
  onConfirm,
  onSkip,
  onClose,
}: PlaceholderFillModalProps) {
  const t = useTranslations('templates');

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const p of placeholders) {
      initial[p] = autoFilled[p] || '';
    }
    return initial;
  });

  const preview = useMemo(() => {
    return substitutePlaceholders(template.body, values);
  }, [template.body, values]);

  return (
    <AppModal
      isOpen
      onClose={onClose}
      size="md"
      className="max-w-lg"
      title={t('fill_placeholders')}
      bodyClassName="overflow-y-auto max-h-[calc(85vh-160px)] space-y-4"
      footer={(
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {t('insert_raw')}
          </Button>
          <Button size="sm" onClick={() => onConfirm(values)}>
            {t('insert_with_values')}
          </Button>
        </div>
      )}
    >
      {placeholders.map((p) => (
        <div key={p}>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="font-mono text-xs text-primary">{`{{${p}}}`}</span>
            {isBuiltInPlaceholder(p) && (
              <span className="text-xs text-muted-foreground">{t(`placeholders.${p}`)}</span>
            )}
          </label>
          <Input
            value={values[p]}
            onChange={(e) => setValues((prev) => ({ ...prev, [p]: e.target.value }))}
            placeholder={t('enter_value')}
            className="mt-1"
          />
        </div>
      ))}

      {preview && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('preview')}</p>
          <div className="text-sm text-foreground whitespace-pre-wrap p-3 rounded-md bg-muted/50 border border-border max-h-32 overflow-y-auto">
            {template.isHTML ? <div dangerouslySetInnerHTML={{ __html: preview }}></div> : preview}
          </div>
        </div>
      )}
    </AppModal>
  );
}
