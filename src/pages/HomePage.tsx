import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferCard } from '@/components/OfferCard';
import { getFeaturedOffers } from '@/lib/mockApi';
import type { Offer } from '@shared/types';
import { ArrowRight, Users, Repeat, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';interface CardFooter {id?: string | number;[key: string]: unknown;}interface CardFooterProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}
export function HomePage() {
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getFeaturedOffers().
    then((data) => {
      setFeaturedOffers(data);
      setIsLoading(false);
    }).
    catch(console.error);
  }, []);
  const howItWorksSteps = [
  {
    icon: Users,
    title: 'Join the Community',
    description: 'Sign up and create your profile. List the skills you can offer and what you might need.'
  },
  {
    icon: Repeat,
    title: 'Exchange Time',
    description: 'Browse offers from other members. When you provide a service, you earn time credits.'
  },
  {
    icon: Award,
    title: 'Redeem Credits',
    description: 'Use your earned time credits to receive services from others in the community. One hour equals one credit.'
  }];

  return (
    <MainLayout>
      {}
      <section className="bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
            Your Time is Valuable.
            <br />
            <span className="text-brand">Bank on It.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            ChronoBank is a community where skills and services are exchanged for time, not money. Everyone's hour is equal.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/offers">Explore Offers</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      {}
      <section id="how-it-works" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold">How ChronoBank Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              A simple, fair system for community exchange.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {howItWorksSteps.map((step, index) =>
            <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
      {}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Offers</h2>
              <p className="mt-2 text-muted-foreground">
                Discover skills and services offered by our community members.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/offers">
                View All Offers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ?
            Array.from({ length: 3 }).map((_, i) =>
            <Card key={i} className="h-full flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </CardFooter>
                  </Card>
            ) :
            featuredOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        </div>
      </section>
    </MainLayout>);

}