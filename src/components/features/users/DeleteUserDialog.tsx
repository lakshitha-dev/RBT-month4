import { useRef } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

interface DeleteUserDialogProps {
  user: User | null;
  onCancel: () => void;
  onConfirm: (user: User) => void;
}

/** Destructive confirmation: alertdialog with initial focus on the safe (Cancel) action. */
export function DeleteUserDialog({ user, onCancel, onConfirm }: DeleteUserDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={Boolean(user)}
      onClose={onCancel}
      role="alertdialog"
      size="sm"
      title="Delete user?"
      initialFocus={cancelRef}
      description={
        <>
          <strong className="font-semibold">{user?.name}</strong> will be moved to deleted users and lose access. You can
          restore them later.
        </>
      }
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => user && onConfirm(user)}>
            Delete user
          </Button>
        </>
      }
    />
  );
}
