import { useEffect, useRef, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { ApiError } from '@/api/client';
import { wizardSchema, type WizardValues } from '@/schemas/userSchema';
import { DEPARTMENTS, type UserInput } from '@/types';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CheckIcon } from '@/components/common/icons';
import { ROLE_OPTIONS } from './UserForm';

const STEPS: { title: string; fields: FieldPath<WizardValues>[] }[] = [
  { title: 'Profile', fields: ['name', 'email', 'department'] },
  { title: 'Role & access', fields: ['role', 'isActive', 'sendInvite'] },
  { title: 'Review', fields: ['confirmed'] },
];

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

interface UserWizardProps {
  onSubmit: (input: UserInput) => Promise<unknown>;
  onCancel: () => void;
}

/** Three-step create-user wizard. Each step validates only its own fields before advancing. */
export function UserWizard({ onSubmit, onCancel }: UserWizardProps) {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: '',
      email: '',
      department: undefined,
      role: 'user',
      isActive: true,
      sendInvite: true,
      confirmed: false,
    },
    mode: 'onTouched',
    shouldUnregister: false,
  });

  // Move focus to the new step's heading so screen-reader users hear where they are.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const next = async () => {
    const valid = await trigger(STEPS[step]!.fields, { shouldFocus: true });
    if (valid) setStep((s) => s + 1);
  };

  const submit = handleSubmit(async ({ name, email, role, isActive, department }) => {
    setServerError(null);
    try {
      await onSubmit({ name, email, role, isActive, department });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setStep(0);
        setError('email', { message: error.message });
      } else {
        setServerError(error instanceof Error ? error.message : 'Could not create the user.');
      }
    }
  });

  const isLastStep = step === STEPS.length - 1;
  const values = getValues();

  return (
    <div>
      <nav aria-label="Progress" className="mb-6">
        <ol className="flex items-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s.title} className="flex flex-1 items-center gap-2" aria-current={current ? 'step' : undefined}>
                <span
                  className={clsx(
                    'num flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    // Done: filled ink with a check; current: ink ring; to do: control ring. All 3:1 or more.
                    done && 'bg-primary text-on-primary',
                    current && 'border-2 border-ink text-ink',
                    !done && !current && 'border border-control text-muted',
                  )}
                >
                  {done ? <CheckIcon /> : i + 1}
                </span>
                <span className={clsx('hidden text-sm font-medium sm:inline', current ? 'text-ink' : 'text-muted')}>
                  {s.title}
                </span>
                <span className="sr-only">{done ? '(completed)' : current ? '(current step)' : ''}</span>
                {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px flex-1 bg-line" />}
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        // Intermediate steps validate and advance; only the last step submits the whole wizard.
        onSubmit={
          isLastStep
            ? submit
            : (event) => {
                event.preventDefault();
                void next();
              }
        }
        noValidate
        className="space-y-4"
      >
        <h2 ref={stepHeadingRef} tabIndex={-1} className="text-base font-semibold text-ink">
          Step {step + 1} of {STEPS.length}: {STEPS[step]!.title}
        </h2>

        {serverError && (
          <Alert variant="error" title="Could not create user" onDismiss={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}

        {step === 0 && (
          <>
            <Input label="Full name" required error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" required hint="An invitation will be sent to this address." error={errors.email?.message} {...register('email')} />
            <Select
              label="Department"
              required
              placeholder="Select a department"
              options={DEPARTMENT_OPTIONS}
              error={errors.department?.message}
              defaultValue=""
              {...register('department')}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Select label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
            <Checkbox label="Active account" description="Inactive users cannot sign in." {...register('isActive')} />
            <Checkbox label="Send invitation email" description="The user receives a link to set their password." {...register('sendInvite')} />
          </>
        )}

        {step === 2 && (
          <>
            <dl className="divide-y divide-line rounded-card bg-raised text-sm">
              {[
                ['Name', values.name],
                ['Email', values.email],
                ['Department', values.department],
                ['Role', values.role ? values.role[0]!.toUpperCase() + values.role.slice(1) : ''],
                ['Status', values.isActive ? 'Active' : 'Inactive'],
                ['Invitation', values.sendInvite ? 'Will be sent' : 'Not sent'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 px-4 py-2.5">
                  <dt className="text-muted">{label}</dt>
                  <dd className="col-span-2 break-words text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <Checkbox label="I confirm these details are correct" error={errors.confirmed?.message} {...register('confirmed')} />
          </>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-rule pt-4 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {/* Each step's primary action is the form's submit button, so Enter in any field
                triggers it (a form without a submit button and 2+ fields ignores Enter). */}
            {!isLastStep ? (
              <Button key="continue" type="submit">
                Continue
              </Button>
            ) : (
              <Button key="create" type="submit" isLoading={isSubmitting}>
                Create user
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
