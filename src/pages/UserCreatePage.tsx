import { Link, useNavigate } from 'react-router-dom';
import { useCreateUser } from '@/hooks/useUsers';
import { Card } from '@/components/common/Card';
import { ChevronLeftIcon } from '@/components/common/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserWizard } from '@/components/features/users/UserWizard';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/users"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
      >
        <ChevronLeftIcon /> Back to users
      </Link>
      <PageHeader title="Add user" description="Create a new account in three quick steps." />
      <Card>
        <Card.Body className="p-5 sm:p-6">
          <UserWizard
            onCancel={() => navigate('/users')}
            onSubmit={async (input) => {
              await createUser.mutateAsync(input);
              navigate('/users');
            }}
          />
        </Card.Body>
      </Card>
    </div>
  );
}
