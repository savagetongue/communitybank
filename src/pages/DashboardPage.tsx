import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingsList } from '@/components/dashboard/BookingsList';
import { OffersManagement } from '@/components/dashboard/OffersManagement';
import { LedgerView } from '@/components/dashboard/LedgerView';
import { ProfileSettings } from '@/components/dashboard/ProfileSettings';
import { RatingForm } from '@/components/RatingForm';
import type { Booking } from '@shared/types';
export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const [isRatingFormOpen, setIsRatingFormOpen] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<Booking | null>(null);
  const handleOpenRatingForm = (booking: Booking) => {
    setSelectedBookingForRating(booking);
    setIsRatingFormOpen(true);
  };
  const handleRatingSuccess = () => {
    setIsRatingFormOpen(false);
    setSelectedBookingForRating(null);
    // Potentially refresh bookings list here if we add a "rated" status
  };
  return (
    <>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16">
            <div className="space-y-2 mb-10">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                Welcome back, {user?.name || 'Member'}!
              </p>
            </div>
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="offers">My Offers</TabsTrigger>
                <TabsTrigger value="ledger">Ledger</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="bookings" className="mt-6">
                <BookingsList onRateBooking={handleOpenRatingForm} />
              </TabsContent>
              <TabsContent value="offers" className="mt-6">
                <OffersManagement />
              </TabsContent>
              <TabsContent value="ledger" className="mt-6">
                <LedgerView />
              </TabsContent>
              <TabsContent value="profile" className="mt-6">
                <ProfileSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MainLayout>
      <RatingForm
        isOpen={isRatingFormOpen}
        onOpenChange={setIsRatingFormOpen}
        booking={selectedBookingForRating}
        onSuccess={handleRatingSuccess}
      />
    </>
  );
}