import { Listing } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Users, Wifi, Wind, Car, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  listing: Listing;
}

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'AC': <Wind className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
};

const sharingTypeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  dormitory: 'Dormitory',
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="card-elevated overflow-hidden group">
      {/* Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.verified && (
            <Badge className="badge-verified gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          )}
          <Badge variant="secondary">
            {sharingTypeLabels[listing.sharingType]}
          </Badge>
        </div>
        
        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
            <span className="font-bold text-lg text-foreground">${listing.rent}</span>
            <span className="text-muted-foreground text-sm">/mo</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{listing.location}, {listing.city}</span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {listing.description}
        </p>

        {/* Facilities */}
        <div className="flex flex-wrap gap-2">
          {listing.facilities.slice(0, 4).map((facility) => (
            <Badge key={facility} variant="outline" className="text-xs gap-1">
              {facilityIcons[facility] || null}
              {facility}
            </Badge>
          ))}
          {listing.facilities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{listing.facilities.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/listings/${listing.id}`} className="w-full">
          <Button className="w-full" variant="default">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
