'use client';

import { ReactNode, createContext, useContext, useId } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Switch as HeroSwitch } from '@/components/ui/switch';
import { AppSelect } from '@/components/ui/select';

/**
 * Lets the controls inside a SettingItem borrow the row's visible label as
 * their accessible name. Without it a bare toggle announces as an unnamed
 * switch, since the row label is a <label> with nothing to point at (#722).
 */
const SettingLabelContext = createContext<string | undefined>(undefined);

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div data-search-label={title} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface SettingItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  locked?: boolean;
  /** Put the control under the label instead of on the trailing edge. */
  stacked?: boolean;
}

export function SettingItem({ label, description, children, locked, stacked }: SettingItemProps) {
  const labelId = useId();
  return (
    <div
      data-search-label={label}
      className={cn(
        "flex flex-col gap-2 py-3 border-b border-border last:border-0",
        !stacked && "sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        locked && "opacity-60",
      )}
    >
      <div className="flex-1 min-w-0 sm:pe-4">
        <div className="flex items-center gap-1.5">
          <label id={labelId} className="text-sm font-medium text-foreground">{label}</label>
          {locked && <Lock className="w-3 h-3 text-muted-foreground" aria-label="Managed by administrator" />}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <SettingLabelContext.Provider value={labelId}>
        <div className={cn("min-w-0 w-full", !stacked && "sm:w-auto sm:max-w-lg", locked && "pointer-events-none")}>{children}</div>
      </SettingLabelContext.Provider>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Overrides the enclosing SettingItem label as the accessible name. */
  ariaLabel?: string;
  /** Test hook (data-testid) for integration tests. */
  testId?: string;
}

export function ToggleSwitch({ checked, onChange, disabled, ariaLabel, testId }: ToggleSwitchProps) {
  const labelledBy = useContext(SettingLabelContext);
  return (
    <HeroSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
      data-testid={testId}
    />
  );
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function RadioGroup({ value, onChange, options }: RadioGroupProps) {
  const labelledBy = useContext(SettingLabelContext);
  return (
    <SegmentedTabs
      value={value}
      onChange={onChange}
      options={options}
      aria-labelledby={labelledBy}
      className="w-full"
    />
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Select({ value, onChange, options, disabled, className, ariaLabel }: SelectProps) {
  const labelledBy = useContext(SettingLabelContext);
  return (
    <AppSelect
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelledBy}
    />
  );
}
