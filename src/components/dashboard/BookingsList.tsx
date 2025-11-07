import { useEffect, useState, useCallback } from 'react';
import type { Booking } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
interface BookingsListProps {
  onRateBooking: (booking: Booking) => void;
  onDisputeBooking: (booking: Booking) => void;
}
export function BookingsList({ onRateBooking, onDisputeBooking }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(s => s.user);
  const fetchBookings = useCallback(() => {
    setIsLoading(true);
    api<Booking[]>('/api/me/bookings')
      .then(data => {
        setBookings(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/complete`, {
        method: 'POST',
      });
      toast.success('Service completed successfully!');
      fetchBookings(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete service.';
      toast.error(errorMessage);
    }
  };
  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell className="font-medium"><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>A history of all your requested and provided services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : bookings.length > 0 ? (
              bookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={booking.otherPartyAvatarUrl} alt="Avatar" />
                        <AvatarFallback>{booking.otherPartyName?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{booking.offerTitle || `Booking ${booking.id.slice(0, 6)}`}</p>
                        <p className="text-sm text-muted-foreground">with {booking.otherPartyName || 'Another Member'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(booking.startTime), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="hidden md:table-cell">{booking.durationMinutes} min</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === 'COMPLETED' ? 'default' : booking.status === 'DISPUTED' ? 'destructive' : 'secondary'}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Member</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user?.id === booking.providerId && booking.status === 'CONFIRMED' && (
                            <DropdownMenuItem onClick={() => handleCompleteBooking(booking.id)}>
                              Complete Service
                            </DropdownMenuItem>
                        )}
                        {booking.status === 'COMPLETED' && !booking.rated && (
                           <DropdownMenuItem onClick={() => onRateBooking(booking)}>
                             Leave a Rating
                           </DropdownMenuItem>
                        )}
                        {booking.status !== 'DISPUTED' && (
                          <DropdownMenuItem className="text-destructive" onClick={() => onDisputeBooking(booking)}>
                            Dispute
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  You have no bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}