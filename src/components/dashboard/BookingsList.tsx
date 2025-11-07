import { useEffect, useState } from 'react';
import type { Booking } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { api } from '@/lib/api-client';
export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    api<Booking[]>('/api/me/bookings')
      .then(data => {
        // Note: The backend currently doesn't denormalize this data.
        // In a real app, we'd either do that on the backend or make extra requests here.
        // For now, we'll display what we have.
        setBookings(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
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
                    <Badge variant={booking.status === 'COMPLETED' ? 'default' : 'secondary'}>{booking.status}</Badge>
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