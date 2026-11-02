import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Button } from './Button';
import { PlusIcon, TrashIcon } from './icons';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Click me', onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Click me' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete user', leftIcon: <TrashIcon /> } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const WithIcon: Story = { args: { leftIcon: <PlusIcon />, children: 'Add user' } };

export const Loading: Story = { args: { isLoading: true, children: 'Saving…' } };

export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

/** Icon-only buttons must have an accessible name via `aria-label`. */
export const IconOnly: Story = {
  args: { 'aria-label': 'Delete user John Doe', variant: 'ghost', children: <TrashIcon /> },
};
