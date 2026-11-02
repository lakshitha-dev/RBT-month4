import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { resetDb } from '@/api/db';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { resolveTheme, useUiStore, type Theme } from '@/stores/uiStore';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/layout/PageHeader';

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Bright background, dark text.' },
  { value: 'dark', label: 'Dark', description: 'Dark background, easier on the eyes at night.' },
  { value: 'system', label: 'System', description: 'Follow your operating system setting.' },
];

/** One settings row: a label column (title, description, current value) beside its panel. */
function SettingsSection({ title, description, summary, children }: { title: string; description: string; summary?: ReactNode; children: ReactNode }) {
  const id = `settings-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-line py-8 first:border-t-0 first:pt-2 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-10">
      <div className="lg:pt-2">
        <h2 id={id} className="text-base font-medium text-ink">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
        {summary && <p className="mt-3 text-sm text-ink">{summary}</p>}
      </div>
      <div className="rounded-[16px] bg-raised p-4">{children}</div>
    </section>
  );
}

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

  const role = user ? user.role[0]!.toUpperCase() + user.role.slice(1) : '';

  return (
    <div className="max-w-[1152px]">
      <PageHeader title="Settings" description="Your profile, how AdminFlow looks, and the demo workspace's data." />

      <SettingsSection title="Profile" description="Your account in this workspace." summary={`Signed in as ${role.toLowerCase()}.`}>
        <dl className="divide-y divide-line rounded-control bg-surface text-sm">
          {[
            ['Name', user?.name],
            ['Email', user?.email],
            ['Role', role],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 px-4 py-3">
              <dt className="text-muted">{label}</dt>
              <dd className="break-words text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </SettingsSection>

      <SettingsSection
        title="Appearance"
        description="Applies to this browser only."
        summary={theme === 'system' ? `Following your system (${resolveTheme('system')} right now).` : undefined}
      >
        <fieldset>
          <legend className="sr-only">Theme</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {THEMES.map((t) => (
              <label
                key={t.value}
                className={clsx(
                  'flex cursor-pointer items-start gap-3 rounded-control border bg-surface p-3 transition-colors',
                  // Selected: an ink border (well over 3:1) plus the native radio's own checked state.
                  theme === t.value ? 'border-ink' : 'border-line hover:border-control',
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => setTheme(t.value)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm">
                  <span className="block font-medium text-ink">{t.label}</span>
                  <span className="text-muted">{t.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </SettingsSection>

      {/* Destructive actions go last, in their own section, with the consequence in words. */}
      <SettingsSection title="Demo data" description="AdminFlow runs on an in-browser mock API saved to this browser.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-control bg-surface p-4">
          <p className="max-w-md text-sm text-ink">
            Resetting restores all 124 seeded users and their activity. Users you added, edited or deleted are lost.
          </p>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Button>
        </div>
      </SettingsSection>

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
    </div>
  );
}
