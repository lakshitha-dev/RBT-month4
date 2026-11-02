import { createContext, useContext, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import clsx from 'clsx';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* components must be rendered inside <Tabs>.');
  return ctx;
}

const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`;
const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;

export interface TabsProps {
  /** Controlled selected tab value. */
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

/**
 * Controlled compound Tabs following the WAI-ARIA tabs pattern:
 * roving tabindex, Arrow/Home/End keys with automatic activation.
 */
function TabsRoot({ value, onValueChange, children, className }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onValueChange, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? []);
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const next = {
      ArrowRight: tabs[(index + 1) % tabs.length],
      ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key];
    if (next) {
      event.preventDefault();
      next.focus();
      next.click();
    }
  };

  return (
    // Focus lives on the tabs (roving tabindex); the list only delegates arrow-key handling.
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={clsx('inline-flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800', className)}
    >
      {children}
    </div>
  );
}

function Tab({ value, children, disabled }: { value: string; children: ReactNode; disabled?: boolean }) {
  const { value: selected, onValueChange, baseId } = useTabs();
  const isSelected = selected === value;
  return (
    <button
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={clsx(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
        isSelected
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: selected, baseId } = useTabs();
  if (selected !== value) return null;
  return (
    <div role="tabpanel" id={panelId(baseId, value)} aria-labelledby={tabId(baseId, value)} tabIndex={0} className={className}>
      {children}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, { List: TabList, Tab, Panel: TabPanel });
