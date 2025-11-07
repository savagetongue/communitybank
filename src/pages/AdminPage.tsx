import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DisputeManagement } from '@/components/admin/DisputeManagement';
import { LedgerAdjustments } from '@/components/admin/LedgerAdjustments';
import { ShieldCheck } from 'lucide-react';
export function AdminPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="space-y-2 mb-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-brand" />
              <h1 className="text-4xl md:text-5xl font-display font-bold">Admin Panel</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Platform management and moderation tools.
            </p>
          </div>
          <Tabs defaultValue="disputes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="disputes">Dispute Management</TabsTrigger>
              <TabsTrigger value="ledger">Ledger Adjustments</TabsTrigger>
            </TabsList>
            <TabsContent value="disputes" className="mt-6">
              <DisputeManagement />
            </TabsContent>
            <TabsContent value="ledger" className="mt-6">
              <LedgerAdjustments />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}