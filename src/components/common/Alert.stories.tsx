import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Alert } from './Alert';
import { Button } from './Button';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { title: 'Heads up', children: 'Something you should know about.' },
  argTypes: { variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] } },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: '`error` and `warning` use `role="alert"` (assertive); `info` and `success` use `role="status"` (polite).',
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { variant: 'info', title: 'New feature', children: 'You can now export users to CSV.' } };

export const Success: Story = { args: { variant: 'success', title: 'User created', children: 'Nuwan Silva was added as an editor.' } };

export const Warning: Story = { args: { variant: 'warning', title: 'Storage at 82%', children: 'Consider archiving old exports.' } };

export const Error: Story = {
  args: {
    variant: 'error',
    title: "Couldn't load users",
    children: 'The server did not respond.',
    action: <Button size="sm" variant="secondary">Retry</Button>,
  },
};

export const Dismissible: Story = { args: { variant: 'info', onDismiss: fn() } };

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3">
      <Alert variant="info" title="Info">Informational message.</Alert>
      <Alert variant="success" title="Success">Operation completed.</Alert>
      <Alert variant="warning" title="Warning">Check this before continuing.</Alert>
      <Alert variant="error" title="Error">Something went wrong.</Alert>
    </div>
  ),
};
