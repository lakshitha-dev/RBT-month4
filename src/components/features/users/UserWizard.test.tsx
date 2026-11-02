import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserWizard } from './UserWizard';

async function fillProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), 'Keyboard Tester');
  await user.type(screen.getByLabelText(/^email/i), 'keyboard.tester@example.com');
  await user.selectOptions(screen.getByLabelText(/department/i), 'Engineering');
}

describe('UserWizard', () => {
  it('blocks an invalid step and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<UserWizard onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const department = screen.getByLabelText(/department/i);
    await vi.waitFor(() => expect(department).toHaveAttribute('aria-invalid', 'true'));
    expect(department).toHaveAccessibleDescription('Select a department');
    expect(screen.getByRole('heading', { name: /step 1 of 3/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();
  });

  it('advances with Continue and moves focus to the next step heading', async () => {
    const user = userEvent.setup();
    render(<UserWizard onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('heading', { name: /step 2 of 3/i })).toHaveFocus();
  });

  it('advances when Enter is pressed inside a field on an intermediate step', async () => {
    const user = userEvent.setup();
    render(<UserWizard onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await fillProfile(user);
    await user.type(screen.getByLabelText(/full name/i), '{Enter}');
    expect(await screen.findByRole('heading', { name: /step 2 of 3/i })).toHaveFocus();
  });

  it('submits the collected values after review and confirmation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UserWizard onSubmit={onSubmit} onCancel={vi.fn()} />);
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.selectOptions(await screen.findByLabelText(/role/i), 'editor');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByLabelText(/i confirm/i));
    await user.click(screen.getByRole('button', { name: 'Create user' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Keyboard Tester',
      email: 'keyboard.tester@example.com',
      department: 'Engineering',
      role: 'editor',
      isActive: true,
    });
  });
});
