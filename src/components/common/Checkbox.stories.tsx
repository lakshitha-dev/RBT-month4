import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Active account', description: 'Inactive users cannot sign in.' },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole('checkbox', { name: 'Active account' });
    await expect(box).toHaveAccessibleDescription('Inactive users cannot sign in.');
    await userEvent.click(box);
    await expect(box).toBeChecked();
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const WithError: Story = {
  args: {
    label: 'I confirm these details are correct',
    description: undefined,
    error: 'Please confirm the details are correct',
  },
};

export const Disabled: Story = { args: { disabled: true } };
