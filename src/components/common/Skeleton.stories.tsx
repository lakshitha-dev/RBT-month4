import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { className: 'h-4 w-48' },
  parameters: {
    docs: {
      description: {
        component:
          'Decorative loading placeholder (`aria-hidden`). Shape it to match the final content to avoid layout shift, and wrap groups in a `role="status"` container with a label.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {};

export const MetricCardPlaceholder: Story = {
  render: () => (
    <div role="status" aria-label="Loading metrics" className="max-w-xs space-y-3 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-40" />
    </div>
  ),
};
