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
    <div className="max-w-2xl">
      <Link
        to="/users"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ChevronLeftIcon /> Back to users
      </Link>
      <PageHeader title="Add user" description="New accounts can sign in as soon as they are created." />
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
