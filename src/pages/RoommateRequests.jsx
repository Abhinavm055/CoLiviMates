import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { roommateRequestsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, MessageCircle, IndianRupee, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const sharingTypeLabels = {
  single: 'Single Room',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  dormitory: 'Dorm Style',
  any: 'Any Type'
};

export default function RoommateRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await roommateRequestsAPI.getAll({ limit: 100 });
        
        // Map backend snake_case properties to frontend camelCase
        const mapped = data.roommateRequests.map(r => ({
          ...r,
          sharingType: r.sharing_type,
          preferredLocation: r.preferred_location,
          userName: r.user_name,
          createdAt: r.created_at ? new Date(r.created_at) : new Date()
        }));
        
        setRequests(mapped);
      } catch (err) {
        console.error('Failed to load roommate requests:', err);
        setError('Failed to fetch roommate requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleConnect = () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to connect with roommate seekers', variant: 'destructive' });
      return;
    }
    toast({ title: 'Connection Request Sent!', description: 'They will receive your request and can choose to connect.' });
  };

  const activeRequests = requests.filter(r => r.status === 'active');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Find Your Perfect Roommate 👋</h1>
            <p className="text-muted-foreground">Connect with students & freshers looking for compatible flatmates</p>
          </div>
          {user && (user.role === 'tenant' || user.role === 'roommate_seeker') && (
            <Link to="/tenant-dashboard">
              <Button variant="accent" className="gap-2">
                <Users className="w-4 h-4" />Post Your Request
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/15 text-destructive rounded-xl mb-8 border border-destructive/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Looking for compatible flatmates...</p>
          </div>
        ) : activeRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRequests.map((request) => (
              <Card key={request.id} className="card-elevated">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" />{request.userName}
                      </div>
                    </div>
                    <Badge variant="secondary">{sharingTypeLabels[request.sharingType] || request.sharingType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{request.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-medium text-foreground">₹{request.budget.toLocaleString('en-IN')}/mo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground text-sm">{request.preferredLocation}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Posted {request.createdAt instanceof Date ? request.createdAt.toLocaleDateString() : 'Recent'}
                    </div>
                    <Button onClick={handleConnect} className="gap-2">
                      <MessageCircle className="w-4 h-4" />Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No roommate requests yet 😕</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">Be the first to post!</p>
            <Link to="/auth?mode=signup">
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />Post Your Request
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
