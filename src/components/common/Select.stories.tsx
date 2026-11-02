import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'user', label: 'User' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Role', options: roles },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { defaultValue: 'editor' } };

export const WithPlaceholder: Story = {
  args: { placeholder: 'Select a role', defaultValue: '', required: true },
};

export const MultiSelect: Story = {
  args: {
    label: 'Departments',
    multiple: true,
    defaultValue: ['Engineering', 'Support'],
    options: ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance'].map((d) => ({ value: d, label: d })),
  },
};

export const WithError: Story = {
  args: { placeholder: 'Select a role', defaultValue: '', error: 'Select a role', required: true },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'user' } };
