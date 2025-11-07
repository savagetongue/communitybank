import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';
import type { Offer } from '@shared/types';
interface OfferCardProps {
  offer: Offer;
}
export function OfferCard({ offer }: OfferCardProps) {
  const providerNameInitial = offer.provider?.name.charAt(0) || 'U';
  return (
    <Link to={`/offers/${offer.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold group-hover:text-brand transition-colors">{offer.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2">{offer.description}</p>
          <div className="flex flex-wrap gap-2">
            {offer.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={offer.provider?.avatarUrl} alt={offer.provider?.name} />
              <AvatarFallback>{providerNameInitial}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">{offer.provider?.name}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-brand" />
            <span>{offer.ratePerHour}h</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}