import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormValues } from '@/schemas/userSchema';
import { ROLES } from '@/types';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

export const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: role[0]!.toUpperCase() + role.slice(1) }));

export interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const EMPTY: UserFormValues = { name: '', email: '', role: 'user', isActive: true };

export function UserForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save' }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
    mode: 'onTouched',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-sm text-muted">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>
      <Input label="Full name" required autoComplete="off" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" required autoComplete="off" error={errors.email?.message} {...register('email')} />
      <Select label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
      <Checkbox
        label="Active account"
        description="Inactive users cannot sign in."
        {...register('isActive')}
      />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} disabled={defaultValues && !isDirty}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
