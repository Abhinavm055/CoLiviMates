import { Listing } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Wifi, Wind, Car, CheckCircle, Utensils, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  listing: Listing;
}

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-3.5 h-3.5" />,
  'AC': <Wind className="w-3.5 h-3.5" />,
  'Parking': <Car className="w-3.5 h-3.5" />,
  'Meals Included': <Utensils className="w-3.5 h-3.5" />,
};

const sharingTypeLabels: Record<string, string> = {
  single: 'Single Occupancy',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  dormitory: 'Dormitory',
};

const sharingTypeColors: Record<string, string> = {
  single: 'bg-primary/10 text-primary border-primary/20',
  double: 'bg-accent/10 text-accent border-accent/20',
  triple: 'bg-success/10 text-success border-success/20',
  dormitory: 'bg-warning/10 text-warning border-warning/20',
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="card-elevated overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-300">
      {/* Image Placeholder */}
      <div className="relative h-52 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Home className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.verified && (
            <Badge className="badge-verified gap-1 shadow-md">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${sharingTypeColors[listing.sharingType]} border font-medium`}>
            {sharingTypeLabels[listing.sharingType]}
          </Badge>
        </div>
        
        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-border/50">
            <span className="font-bold text-xl text-foreground">₹{listing.rent.toLocaleString('en-IN')}</span>
            <span className="text-muted-foreground text-sm">/mo</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
          <span className="text-sm line-clamp-1">{listing.location}, {listing.city}</span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {listing.description}
        </p>

        {/* Facilities */}
        <div className="flex flex-wrap gap-2">
          {listing.facilities.slice(0, 3).map((facility) => (
            <Badge key={facility} variant="secondary" className="text-xs gap-1.5 font-normal py-1">
              {facilityIcons[facility] || <CheckCircle className="w-3.5 h-3.5" />}
              {facility}
            </Badge>
          ))}
          {listing.facilities.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal py-1">
              +{listing.facilities.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link to={`/listings/${listing.id}`} className="w-full">
          <Button className="w-full font-semibold" variant="default" size="lg">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
