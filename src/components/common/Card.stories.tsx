import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: 'Compound component: `<Card>` with optional `<Card.Header>`, `<Card.Body>` and `<Card.Footer>`.',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderBodyFooter: Story = {
  render: () => (
    <Card>
      <Card.Header title="Team plan" description="Billed monthly" />
      <Card.Body>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Up to 25 seats, audit log, SSO and priority support.
        </p>
      </Card.Body>
      <Card.Footer>
        <Button variant="secondary">Cancel</Button>
        <Button>Upgrade</Button>
      </Card.Footer>
    </Card>
  ),
};

export const WithHeaderActions: Story = {
  render: () => (
    <Card>
      <Card.Header title="Recent activity" actions={<Button size="sm" variant="ghost">View all</Button>} />
      <Card.Body>
        <ul className="space-y-2 text-sm">
          <li>Maya Perera created user Liam Khan</li>
          <li>Ravi Silva updated the role of Uma Rossi</li>
        </ul>
      </Card.Body>
    </Card>
  ),
};

export const BodyOnly: Story = {
  render: () => (
    <Card>
      <Card.Body>
        <p className="text-sm">A minimal card with only a body.</p>
      </Card.Body>
    </Card>
  ),
};
