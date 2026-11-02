import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { SearchIcon } from './icons';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Full name', placeholder: 'Jane Doe' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'search'] },
  },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Email: Story = {
  args: { label: 'Email', type: 'email', placeholder: 'jane@example.com', autoComplete: 'email' },
};

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: undefined, hint: 'At least 8 characters.' },
};

export const WithError: Story = {
  args: { label: 'Email', type: 'email', defaultValue: 'not-an-email', error: 'Invalid email address', required: true },
};

export const WithHint: Story = {
  args: { hint: 'This is shown to other administrators.' },
};

export const WithIcon: Story = {
  args: { label: 'Search users', type: 'search', placeholder: 'Name or email', leftIcon: <SearchIcon /> },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read only value' } };
