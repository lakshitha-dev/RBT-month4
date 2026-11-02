import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricsSection } from '@/components/features/dashboard/MetricsSection';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { TrendCard } from '@/components/features/dashboard/TrendCard';

/**
 * Each section owns its own query (state colocation), so data arriving for one widget
 * re-renders only that widget rather than the whole dashboard.
 */
export default function DashboardPage() {
  const name = useAuthStore((s) => s.user?.name.split(' ')[0]);

  return (
    <>
      <PageHeader title="Dashboard" description={`Good to see you${name ? `, ${name}` : ''}. Here's what's happening today.`} />
      <MetricsSection />
      <div className="defer-offscreen grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <TrendCard />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </>
  );
}
