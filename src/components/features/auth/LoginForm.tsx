import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DEMO_CREDENTIALS } from '@/api/auth';
import { loginSchema, type LoginValues } from '@/schemas/loginSchema';
import { useAuthStore } from '@/stores/authStore';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    shouldFocusError: true,
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      onSuccess();
    } catch {
      // The store exposes the error message; it is rendered in the alert below.
    }
  };

  const fillDemo = () => {
    clearError();
    setValue('email', DEMO_CREDENTIALS.email, { shouldValidate: true });
    setValue('password', DEMO_CREDENTIALS.password, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && (
        <Alert variant="error" title="Sign in failed" onDismiss={clearError}>
          {error}
        </Alert>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="username"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
      <div className="rounded-card bg-raised p-3 text-sm">
        <p className="text-muted">
          Demo account: <span className="text-ink">{DEMO_CREDENTIALS.email}</span> ·{' '}
          <span className="text-ink">{DEMO_CREDENTIALS.password}</span>
        </p>
        <button type="button" onClick={fillDemo} className="mt-1 font-medium text-ink underline underline-offset-2 hover:text-accent">
          Fill in demo credentials
        </button>
      </div>
    </form>
  );
}
