import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

export default function NotFoundPage() {
  return (
    <PageHeader
      title="Page not found"
      description="There is no page at this address. It may have been moved, or the link may be mistyped."
      actions={
        <Link
          to="/"
          className="inline-flex h-9 items-center rounded-control bg-primary px-3.5 text-sm font-medium text-on-primary hover:opacity-90"
        >
          Back to overview
        </Link>
      }
    />
  );
}
