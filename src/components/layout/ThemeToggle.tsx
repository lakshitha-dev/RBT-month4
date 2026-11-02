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
      className="flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink"
    >
      <Icon className="size-[18px]" />
    </button>
  );
}
