import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ListingCard } from '@/components/listings/ListingCard';
import { mockListings } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, Home, MapPin } from 'lucide-react';

const cities = ['All Cities', 'Bengaluru', 'Chennai', 'Pune', 'Hyderabad', 'Coimbatore', 'Kochi'];

export default function Listings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingType, setSharingType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [maxRent, setMaxRent] = useState<number>(10000);
  const [showFilters, setShowFilters] = useState(false);

  const approvedListings = mockListings.filter(l => l.status === 'approved');

  const filteredListings = useMemo(() => {
    return approvedListings.filter(listing => {
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSharingType = sharingType === 'all' || listing.sharingType === sharingType;
      const matchesCity = selectedCity === 'all' || listing.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesRent = listing.rent <= maxRent;

      return matchesSearch && matchesSharingType && matchesCity && matchesRent;
    });
  }, [approvedListings, searchQuery, sharingType, selectedCity, maxRent]);

  const clearFilters = () => {
    setSearchQuery('');
    setSharingType('all');
    setSelectedCity('all');
    setMaxRent(10000);
  };

  const hasFilters = searchQuery || sharingType !== 'all' || selectedCity !== 'all' || maxRent < 10000;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Find Your Perfect Stay</h1>
          </div>
          <p className="text-muted-foreground ml-13">Affordable PGs, shared rooms & hostels for students across India 🎓</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-2xl p-4 md:p-6 card-elevated mb-8 border border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by location, city, or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button 
              variant="outline" 
              className="md:hidden gap-2 h-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-36 h-12">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.slice(1).map(city => (
                    <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sharingType} onValueChange={setSharingType}>
                <SelectTrigger className="w-40 h-12">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="double">Double Sharing</SelectItem>
                  <SelectItem value="triple">Triple Sharing</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-3 min-w-[220px] bg-muted/50 rounded-lg px-4 py-2">
                <Label className="text-sm whitespace-nowrap font-medium">Max ₹{maxRent.toLocaleString('en-IN')}</Label>
                <Slider
                  value={[maxRent]}
                  onValueChange={([value]) => setMaxRent(value)}
                  max={15000}
                  min={2000}
                  step={500}
                  className="w-28"
                />
              </div>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-border space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">City</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.slice(1).map(city => (
                      <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Room Type</Label>
                <Select value={sharingType} onValueChange={setSharingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single">Single Room</SelectItem>
                    <SelectItem value="double">Double Sharing</SelectItem>
                    <SelectItem value="triple">Triple Sharing</SelectItem>
                    <SelectItem value="dormitory">Dormitory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Max Rent: ₹{maxRent.toLocaleString('en-IN')}/month</Label>
                <Slider
                  value={[maxRent]}
                  onValueChange={([value]) => setMaxRent(value)}
                  max={15000}
                  min={2000}
                  step={500}
                />
              </div>

              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-1">
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredListings.length}</span> {filteredListings.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No rooms found in your budget yet 😕</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Don't worry! Try increasing your budget or checking other cities. New affordable PGs are added daily.
            </p>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
