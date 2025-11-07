import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { api } from '@/lib/api-client';
import type { Offer, Member } from '@shared/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Star, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { RequestForm } from '@/components/RequestForm';
import { useAuthStore } from '@/stores/authStore';
import { BookingFlow } from '@/components/BookingFlow';
export function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [provider, setProvider] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const user = useAuthStore(s => s.user);
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      api<Offer>(`/api/offers/${id}`)
        .then((offerData) => {
          if (offerData) {
            setOffer(offerData);
            // Fetch full provider details
            api<Member>(`/api/members/${offerData.providerId}`)
              .then(setProvider)
              .catch(console.error);
          }
        })
        .catch(console.error)
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);
  const handleRequestSuccess = (requestId: string) => {
    setCurrentRequestId(requestId);
    setIsRequestFormOpen(false);
    setIsBookingFlowOpen(true);
  };
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-48 mb-12" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  if (!offer) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-2xl font-bold">Offer not found</h1>
          <p className="text-muted-foreground mt-2">The offer you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/offers">Back to Marketplace</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  return (
    <>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-12">
            <Link to="/offers" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to all offers
            </Link>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="md:col-span-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold">{offer.title}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {offer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
                <div className="mt-8 prose dark:prose-invert max-w-none">
                  <p className="text-lg text-muted-foreground">{offer.description}</p>
                </div>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="h-4 w-4 text-brand" />
                        <span>{offer.ratePerHour} credits / hour</span>
                      </div>
                    </div>
                    {user ? (
                       <Button className="w-full" size="lg" onClick={() => setIsRequestFormOpen(true)}>
                         Request Service
                       </Button>
                    ) : (
                      <Button className="w-full" size="lg" asChild>
                        <Link to="/login">Login to Request</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>About the Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={offer.providerAvatarUrl} alt={offer.providerName} />
                        <AvatarFallback>{offer.providerName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{offer.providerName}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{offer.providerRating}</span>
                        </div>
                      </div>
                    </div>
                    {provider?.bio ? (
                      <p className="text-sm text-muted-foreground">{provider.bio}</p>
                    ) : (
                      <Skeleton className="h-12 w-full" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
      <RequestForm
        isOpen={isRequestFormOpen}
        onOpenChange={setIsRequestFormOpen}
        offer={offer}
        onSuccess={handleRequestSuccess}
      />
      <BookingFlow
        isOpen={isBookingFlowOpen}
        onOpenChange={setIsBookingFlowOpen}
        offer={offer}
        requestId={currentRequestId}
      />
    </>
  );
}