import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { mockListings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, MapPin, Calendar, User, CheckCircle, 
  Wifi, Wind, Car, Home, Users, DollarSign, Send 
} from 'lucide-react';
import { useState } from 'react';

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-5 h-5" />,
  'AC': <Wind className="w-5 h-5" />,
  'Parking': <Car className="w-5 h-5" />,
  'Kitchen': <Home className="w-5 h-5" />,
};

const sharingTypeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  dormitory: 'Dormitory',
};

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const listing = mockListings.find(l => l.id === id);

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Listing Not Found</h1>
          <Link to="/listings">
            <Button>Back to Listings</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleContactRequest = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to contact the owner',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please write a message to the owner',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setMessage('');

    toast({
      title: 'Request Sent!',
      description: 'The owner will review your request and get back to you.',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/listings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {listing.verified && (
                  <Badge className="badge-verified gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
                <Badge variant="secondary">{sharingTypeLabels[listing.sharingType]}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{listing.location}, {listing.city}</span>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Space</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Facilities & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {listing.facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="text-primary">
                        {facilityIcons[facility] || <CheckCircle className="w-5 h-5" />}
                      </div>
                      <span className="font-medium text-foreground">{facility}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-foreground">₹{listing.rent.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available From</p>
                      <p className="font-medium text-foreground">
                        {listing.availableFrom.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room Type</p>
                      <p className="font-medium text-foreground">{sharingTypeLabels[listing.sharingType]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Listed By</p>
                      <p className="font-medium text-foreground">{listing.ownerName}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h4 className="font-semibold text-foreground mb-3">Contact Owner</h4>
                  <Textarea
                    placeholder="Hi, I'm interested in this room. Is it still available?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleContactRequest}
                    disabled={sending}
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send Request'}
                  </Button>
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      You'll need to <Link to="/auth" className="text-primary hover:underline">login</Link> to contact the owner
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
