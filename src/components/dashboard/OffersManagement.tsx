import { useEffect, useState, useCallback } from 'react';
import type { Offer } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { OfferForm, OfferFormValues } from '../OfferForm';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
export function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false);
  const fetchOffers = useCallback(() => {
    setIsLoading(true);
    api<Offer[]>('/api/me/offers')
      .then(setOffers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);
  const handleCreateOffer = async (data: OfferFormValues) => {
    const offerData = {
      ...data,
      skills: data.skills.split(',').map(s => s.trim()),
    };
    try {
      await api('/api/offers', {
        method: 'POST',
        body: JSON.stringify(offerData),
      });
      toast.success('Offer created successfully!');
      fetchOffers(); // Refresh the list
      return true; // Indicate success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create offer.';
      toast.error(errorMessage);
      return false; // Indicate failure
    }
  };
  const renderSkeleton = () => (
    <>
      {[...Array(2)].map((_, i) => (
        <TableRow key={i}>
          <TableCell className="font-medium"><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </>
  );
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Offers</CardTitle>
            <CardDescription>Manage your services available on the marketplace.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setIsOfferFormOpen(true)}>
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
                  <TableCell colSpan={4} className="text-center h-24">
                    You haven't created any offers yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <OfferForm
        isOpen={isOfferFormOpen}
        onOpenChange={setIsOfferFormOpen}
        onSubmit={handleCreateOffer}
      />
    </>
  );
}