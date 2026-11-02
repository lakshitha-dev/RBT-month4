import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Tabs } from './Tabs';

function ControlledTabs({ initial = 'overview' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="max-w-lg">
      <Tabs value={value} onValueChange={setValue}>
        <Tabs.List label="Account sections">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" className="mt-4 rounded-lg text-sm">
          Account overview: plan, seats and usage.
        </Tabs.Panel>
        <Tabs.Panel value="security" className="mt-4 rounded-lg text-sm">
          Two-factor authentication and active sessions.
        </Tabs.Panel>
        <Tabs.Panel value="billing" className="mt-4 rounded-lg text-sm">
          Invoices and payment methods.
        </Tabs.Panel>
      </Tabs>
      <p className="mt-6 text-xs text-slate-600 dark:text-slate-400">
        Controlled value: <code>{value}</code>
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: ControlledTabs,
  parameters: {
    docs: {
      description: {
        component:
          'Controlled compound Tabs (`value` + `onValueChange`) implementing the WAI-ARIA tabs pattern: roving tabindex and Arrow / Home / End keys.',
      },
    },
  },
} satisfies Meta<typeof ControlledTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  play: async ({ canvas, userEvent }) => {
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    await userEvent.click(overview);
    await userEvent.keyboard('{ArrowRight}');
    const security = canvas.getByRole('tab', { name: 'Security' });
    await expect(security).toHaveFocus();
    await expect(security).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel', { name: 'Security' })).toBeVisible();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
  },
};

export const StartOnBilling: Story = { args: { initial: 'billing' } };
