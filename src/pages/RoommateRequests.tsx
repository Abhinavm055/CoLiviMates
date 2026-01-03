import { Layout } from '@/components/layout/Layout';
import { mockRoommateRequests } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Users, Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const sharingTypeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  any: 'Any Type',
};

export default function RoommateRequests() {
  const { user } = useAuth();
  const { toast } = useToast();

  const activeRequests = mockRoommateRequests.filter(r => r.status === 'active');

  const handleConnect = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to connect with roommate seekers',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Connection Request Sent!',
      description: 'They will receive your request and can choose to connect.',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Find Roommates</h1>
            <p className="text-muted-foreground">Connect with people looking for compatible roommates</p>
          </div>
          
          {user && (user.role === 'tenant' || user.role === 'roommate_seeker') && (
            <Link to="/tenant-dashboard">
              <Button variant="accent" className="gap-2">
                <Users className="w-4 h-4" />
                Post Your Request
              </Button>
            </Link>
          )}
        </div>

        {/* Requests Grid */}
        {activeRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRequests.map((request) => (
              <Card key={request.id} className="card-elevated">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" />
                        {request.userName}
                      </div>
                    </div>
                    <Badge variant="secondary">{sharingTypeLabels[request.sharingType]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{request.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
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
                      Posted {request.createdAt.toLocaleDateString()}
                    </div>
                    <Button onClick={handleConnect} className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Requests</h3>
            <p className="text-muted-foreground mb-4">Be the first to post a roommate request!</p>
            <Link to="/auth?mode=signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
