import { useUiStore, type Theme } from '@/stores/uiStore';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/common/icons';

const ORDER: Theme[] = ['light', 'dark', 'system'];
const ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon };
const LABELS = { light: 'Light', dark: 'Dark', system: 'System' };

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[next]} theme`}
      title={`Theme: ${LABELS[theme]}`}
      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <Icon className="size-5" />
    </button>
  );
}
