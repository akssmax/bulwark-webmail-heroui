import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingItem, ToggleSwitch, RadioGroup, Select } from '../settings-section';

describe('SettingItem controls', () => {
  it('names a toggle after the row label and reports its state', () => {
    render(
      <SettingItem label="Conversation view">
        <ToggleSwitch checked onChange={() => {}} />
      </SettingItem>
    );

    const toggle = screen.getByRole('switch', { name: 'Conversation view' });
    expect(toggle).toBeChecked();
  });

  it('lets an explicit ariaLabel win over the row label', () => {
    render(
      <SettingItem label="Conversation view">
        <ToggleSwitch checked={false} onChange={() => {}} ariaLabel="Group by thread" />
      </SettingItem>
    );

    expect(screen.getByRole('switch', { name: 'Group by thread' })).not.toBeChecked();
  });

  it('reports which option of a segmented control is active', () => {
    render(
      <SettingItem label="Density">
        <RadioGroup
          value="cosy"
          onChange={() => {}}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'cosy', label: 'Cosy' },
          ]}
        />
      </SettingItem>
    );

    expect(screen.getByRole('tab', { name: 'Cosy' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Compact' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tablist', { name: 'Density' })).toBeTruthy();
  });

  it('names a select after the row label', () => {
    render(
      <SettingItem label="Time format">
        <Select value="24h" onChange={() => {}} options={[{ value: '24h', label: '24 hour' }]} />
      </SettingItem>
    );

    expect(screen.getByRole('button', { name: /24 hour|Time format/i })).toBeTruthy();
  });

  it('works standalone, outside a SettingItem', () => {
    render(<ToggleSwitch checked onChange={() => {}} ariaLabel="Standalone" />);

    expect(screen.getByRole('switch', { name: 'Standalone' })).toBeTruthy();
  });
});
