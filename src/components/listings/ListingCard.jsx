import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Wifi, Wind, Car, CheckCircle, Utensils, Home, GraduationCap, Sparkles, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

const facilityIcons = {
  'WiFi': <Wifi className="w-3.5 h-3.5" />,
  'AC': <Wind className="w-3.5 h-3.5" />,
  'Parking': <Car className="w-3.5 h-3.5" />,
  'Meals Included': <Utensils className="w-3.5 h-3.5" />,
};

const sharingTypeLabels = {
  single: 'Single Room',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  dormitory: 'Dorm Style',
};

const sharingTypeColors = {
  single: 'bg-primary/10 text-primary border-primary/20',
  double: 'bg-accent/10 text-accent border-accent/20',
  triple: 'bg-success/10 text-success border-success/20',
  dormitory: 'bg-warning/10 text-warning border-warning/20',
};

const isStudentFriendly = (listing) => {
  const keywords = ['student', 'college', 'university', 'psg', 'vit', 'anna', 'christ', 'jntu'];
  const text = (listing.title + ' ' + listing.description).toLowerCase();
  return keywords.some(k => text.includes(k));
};

const isBudgetStay = (rent) => rent <= 5000;
const isBestValue = (rent, sharingType) => {
  if (sharingType === 'single' && rent <= 8000) return true;
  if (sharingType === 'double' && rent <= 6000) return true;
  if (sharingType === 'triple' && rent <= 4500) return true;
  return false;
};

export function ListingCard({ listing }) {
  const showStudentBadge = isStudentFriendly(listing);
  const showBudgetBadge = isBudgetStay(listing.rent);
  const showValueBadge = isBestValue(listing.rent, listing.sharingType);

  return (
    <Card className="card-elevated overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="relative h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {listing.verified && (
            <Badge className="badge-verified gap-1 shadow-md text-xs">
              <CheckCircle className="w-3 h-3" />Verified
            </Badge>
          )}
          {showStudentBadge && (
            <Badge className="badge-student gap-1 shadow-md text-xs">
              <GraduationCap className="w-3 h-3" />Student Friendly
            </Badge>
          )}
          {showBudgetBadge && (
            <Badge className="badge-budget gap-1 shadow-md text-xs">
              <Sparkles className="w-3 h-3" />Budget Stay
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${sharingTypeColors[listing.sharingType]} border font-medium text-xs`}>
            {sharingTypeLabels[listing.sharingType]}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-border/50">
            <div className="flex items-center gap-0.5">
              <IndianRupee className="w-4 h-4 text-primary font-bold" />
              <span className="font-bold text-lg text-foreground">{listing.rent.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-muted-foreground text-xs block text-right">per person/month</span>
          </div>
        </div>
        {showValueBadge && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-accent text-accent-foreground text-xs font-semibold shadow-md">
              🔥 Best Value
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
          <span className="text-sm line-clamp-1">{listing.location}, {listing.city}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {listing.facilities.slice(0, 3).map((facility) => (
            <Badge key={facility} variant="secondary" className="text-xs gap-1 font-normal py-0.5 px-2">
              {facilityIcons[facility] || <CheckCircle className="w-3 h-3" />}
              {facility}
            </Badge>
          ))}
          {listing.facilities.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal py-0.5 px-2">
              +{listing.facilities.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/listings/${listing.id}`} className="w-full">
          <Button className="w-full font-semibold" variant="default">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
