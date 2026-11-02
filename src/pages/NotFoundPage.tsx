import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">404</p>
      <div className="mt-2 flex justify-center">
        <PageHeader title="Page not found" description="Sorry, we couldn't find the page you're looking for." />
      </div>
      <Link
        to="/"
        className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
