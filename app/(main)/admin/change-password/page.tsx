'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/browser-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordField } from '@/components/ui/password-field';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await apiFetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => router.push('/admin'), 2000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to change password.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Change Password</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your admin password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Current Password</label>
          <PasswordField
            value={currentPassword}
            onChange={setCurrentPassword}
            required
            inputClassName="h-9"
            autoComplete="current-password"
            showLock
            aria-label="Current Password"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="h-9"
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Confirm New Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="h-9"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600">Password changed. Redirecting...</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}
