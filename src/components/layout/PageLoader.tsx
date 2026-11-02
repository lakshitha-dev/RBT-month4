import { Spinner } from '@/components/common/Spinner';

export function PageLoader({ label = 'Loading page' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted">
      <Spinner size="lg" label={label} />
    </div>
  );
}
