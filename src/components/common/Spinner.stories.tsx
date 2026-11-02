import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md', label: 'Loading' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div className="text-brand-600 dark:text-brand-300"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Loading indicator rendered as `role="status"` with a visually hidden label. Pass `label={null}` when it is decorative (e.g. inside a busy button that already sets `aria-busy`).',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" label="Loading dashboard" />
    </div>
  ),
};
