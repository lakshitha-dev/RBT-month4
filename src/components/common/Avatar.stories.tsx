import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Amara Perera', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  parameters: {
    docs: {
      description: {
        component: 'Decorative initials avatar (`aria-hidden`); colour is derived from the name. Always render the name as text next to it.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <span className="flex items-center gap-2 text-sm">
      <Avatar {...args} />
      {args.name}
    </span>
  ),
};

export const List: Story = {
  render: () => (
    <ul className="space-y-2">
      {['Amara Perera', 'Ben Smith', 'Chen Kim', 'Dilani Silva'].map((name) => (
        <li key={name} className="flex items-center gap-2 text-sm">
          <Avatar name={name} size="sm" />
          {name}
        </li>
      ))}
    </ul>
  ),
};
