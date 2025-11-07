import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold">Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {user?.name || 'Member'}!
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Your ChronoBank</CardTitle>
              <CardDescription>This is your personal space. More features coming soon!</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Here you will be able to see your bookings, manage your offers, and view your time ledger.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}