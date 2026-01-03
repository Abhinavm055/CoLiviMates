import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ListingCard } from '@/components/listings/ListingCard';
import { mockListings } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X } from 'lucide-react';

export default function Listings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingType, setSharingType] = useState<string>('all');
  const [maxRent, setMaxRent] = useState<number>(2000);
  const [showFilters, setShowFilters] = useState(false);

  const approvedListings = mockListings.filter(l => l.status === 'approved');

  const filteredListings = useMemo(() => {
    return approvedListings.filter(listing => {
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSharingType = sharingType === 'all' || listing.sharingType === sharingType;
      const matchesRent = listing.rent <= maxRent;

      return matchesSearch && matchesSharingType && matchesRent;
    });
  }, [approvedListings, searchQuery, sharingType, maxRent]);

  const clearFilters = () => {
    setSearchQuery('');
    setSharingType('all');
    setMaxRent(2000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Browse Rooms</h1>
          <p className="text-muted-foreground">Find your perfect co-living space from our verified listings</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-xl p-4 md:p-6 card-elevated mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by location, city, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button 
              variant="outline" 
              className="md:hidden gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              <Select value={sharingType} onValueChange={setSharingType}>
                <SelectTrigger className="w-40">
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

              <div className="flex items-center gap-3 min-w-[200px]">
                <Label className="text-sm whitespace-nowrap">Max ${maxRent}</Label>
                <Slider
                  value={[maxRent]}
                  onValueChange={([value]) => setMaxRent(value)}
                  max={3000}
                  min={200}
                  step={50}
                  className="w-32"
                />
              </div>

              {(searchQuery || sharingType !== 'all' || maxRent < 2000) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
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
                <Label>Room Type</Label>
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
                <Label>Max Rent: ${maxRent}/month</Label>
                <Slider
                  value={[maxRent]}
                  onValueChange={([value]) => setMaxRent(value)}
                  max={3000}
                  min={200}
                  step={50}
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
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          </p>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
