import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Active', tone: 'success' },
  argTypes: { tone: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] } },
  parameters: {
    docs: { description: { component: 'Status/role label. Always carries text, so meaning never depends on colour alone (WCAG 1.4.1).' } },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Neutral</Badge>
      <Badge tone="brand">Admin</Badge>
      <Badge tone="success">Active</Badge>
      <Badge tone="warning">Editor</Badge>
      <Badge tone="danger">Deleted</Badge>
    </div>
  ),
};
