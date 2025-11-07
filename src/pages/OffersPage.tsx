import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { OfferCard } from '@/components/OfferCard';
import { api } from '@/lib/api-client';
import type { Offer } from '@shared/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    api<Offer[]>('/api/offers')
      .then((data) => {
        setOffers(data);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold">Offers Marketplace</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Find the skills and services you need, offered by talented members of our community.
            </p>
          </div>
          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search for offers or skills..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="design">Graphic Design</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Offers Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-full flex flex-col">
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                    <div className="p-6 pt-0 flex-grow space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </div>
                    <div className="p-6 pt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </Card>
                ))
              : offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}