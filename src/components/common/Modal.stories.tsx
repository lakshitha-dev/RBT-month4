import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, waitFor } from 'storybook/test';
import { Button } from './Button';
import { Input } from './Input';
import { Modal, type ModalProps } from './Modal';

/** Wraps the controlled Modal with a trigger so focus trap + focus restore can be tried. */
function ModalDemo(props: Partial<ModalProps> & { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const { triggerLabel = 'Open dialog', ...rest } = props;
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <Modal
        title="Dialog title"
        {...rest}
        open={open}
        onClose={() => {
          rest.onClose?.();
          setOpen(false);
        }}
      />
    </>
  );
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: { open: false, onClose: fn(), title: 'Dialog title' },
  parameters: {
    docs: {
      description: {
        component:
          'Accessible dialog: rendered in a portal with `aria-modal`, labelled by its title and described by its description. Focus is trapped inside, Esc closes it, and focus returns to the trigger.',
      },
      story: { inline: false, iframeHeight: 420 },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmDelete: Story = {
  render: (args) => {
    function Demo() {
      const cancelRef = useRef<HTMLButtonElement>(null);
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="danger" onClick={() => setOpen(true)}>
            Delete user
          </Button>
          <Modal
            open={open}
            onClose={() => {
              args.onClose();
              setOpen(false);
            }}
            role="alertdialog"
            size="sm"
            title="Confirm delete"
            description="Are you sure? Maya Fernando will lose access immediately."
            initialFocus={cancelRef}
            footer={
              <>
                <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setOpen(false)}>
                  Delete
                </Button>
              </>
            }
          />
        </>
      );
    }
    return <Demo />;
  },
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole('button', { name: 'Delete user' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('alertdialog', { name: 'Confirm delete' });
    await expect(dialog).toHaveAccessibleDescription(/are you sure/i);
    await expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
    await expect(trigger).toHaveFocus();
  },
};

export const WithForm: Story = {
  render: () => (
    <ModalDemo
      triggerLabel="Edit profile"
      title="Edit profile"
      description="Changes are saved when you press Save."
      footer={<Button>Save</Button>}
    >
      <div className="space-y-4">
        <Input label="Full name" defaultValue="Maya Fernando" />
        <Input label="Email" type="email" defaultValue="maya.fernando@adminflow.dev" />
      </div>
    </ModalDemo>
  ),
};

export const Large: Story = {
  render: () => (
    <ModalDemo size="lg" title="Terms of service" triggerLabel="Read terms">
      <div className="space-y-3 text-sm">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i}>
            Paragraph {i + 1}. Long content scrolls inside the dialog body while the header and footer stay visible.
          </p>
        ))}
      </div>
    </ModalDemo>
  ),
};
