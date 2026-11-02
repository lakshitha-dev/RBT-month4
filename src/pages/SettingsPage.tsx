import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { resetDb } from '@/api/db';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { useUiStore, type Theme } from '@/stores/uiStore';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/layout/PageHeader';

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Bright background, dark text.' },
  { value: 'dark', label: 'Dark', description: 'Dark background, easier on the eyes at night.' },
  { value: 'system', label: 'System', description: 'Follow your operating system setting.' },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const queryClient = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);

  const resetData = () => {
    resetDb();
    queryClient.invalidateQueries();
    setConfirmReset(false);
    notify({ type: 'success', title: 'Demo data reset', message: 'All users and activity were restored to the original seed.' });
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and preferences." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header title="Profile" />
          <Card.Body>
            <dl className="space-y-3 text-sm">
              {[
                ['Name', user?.name],
                ['Email', user?.email],
                ['Role', user?.role],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4">
                  <dt className="font-medium text-slate-600 dark:text-slate-400">{label}</dt>
                  <dd className="col-span-2 text-slate-900 capitalize dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="Appearance" />
          <Card.Body>
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-200">Theme</legend>
              <div className="space-y-2">
                {THEMES.map((t) => (
                  <label
                    key={t.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 dark:border-slate-700 dark:has-[:checked]:border-brand-400 dark:has-[:checked]:bg-brand-800/30"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={t.value}
                      checked={theme === t.value}
                      onChange={() => setTheme(t.value)}
                      className="mt-0.5 accent-brand-600"
                    />
                    <span className="text-sm">
                      <span className="block font-medium text-slate-900 dark:text-white">{t.label}</span>
                      <span className="text-slate-600 dark:text-slate-400">{t.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header title="Demo data" description="The app uses an in-browser mock API persisted to localStorage." />
          <Card.Footer className="justify-start border-t-0">
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              Reset demo data
            </Button>
          </Card.Footer>
        </Card>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        role="alertdialog"
        size="sm"
        title="Reset demo data?"
        description="All users you created, edited or deleted will be restored to the original seed data."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={resetData}>
              Reset data
            </Button>
          </>
        }
      />
    </>
  );
}
