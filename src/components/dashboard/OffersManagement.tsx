import { useEffect, useState } from 'react';
import { getOffersByProviderId } from '@/lib/mockApi';
import type { Offer } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
export function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // In a real app, you'd get the user ID from the auth store
    // Assuming 'user-demo' is a provider for this mock
    getOffersByProviderId('provider-1') // Using a fixed ID for demo
      .then(data => {
        setOffers(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);
  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={4}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
    </TableRow>
  );
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Offers</CardTitle>
          <CardDescription>Manage your services available on the marketplace.</CardDescription>
        </div>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            New Offer
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Rate</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : offers.length > 0 ? (
              offers.map(offer => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>
                    <Badge variant={offer.isActive ? 'outline' : 'secondary'}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{offer.ratePerHour} credits/hr</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  You haven't created any offers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}