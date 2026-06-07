import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, listingsAPI, roommateRequestsAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Users, Home, MessageSquare, Shield, CheckCircle, XCircle, Clock, Eye, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [dbListings, setDbListings] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbRequests, setDbRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const usersData = await authAPI.getAllUsers();
      const listingsData = await listingsAPI.getAll({ limit: 1000 });
      const requestsData = await roommateRequestsAPI.getAll({ limit: 1000 });

      setDbUsers(usersData.users);
      
      // Map listing properties to camelCase expected by components
      const mappedListings = listingsData.listings.map(l => ({
        ...l,
        sharingType: l.sharing_type,
        ownerName: l.owner_name
      }));
      setDbListings(mappedListings);
      setDbRequests(requestsData.roommateRequests);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({ title: 'Error', description: 'Could not load data from database.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') return <Navigate to="/auth" replace />;

  const pendingListings = dbListings.filter(l => l.status === 'pending');
  const stats = {
    totalUsers: dbUsers.length,
    totalListings: dbListings.length,
    pendingApproval: pendingListings.length,
    activeRequests: dbRequests.filter(r => r.status === 'active' || r.status === undefined || r.status === null).length,
  };

  const handleListingAction = async (listingId, action) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await listingsAPI.update(listingId, { status });
      toast({
        title: action === 'approve' ? 'Listing Approved' : 'Listing Rejected',
        description: action === 'approve' ? 'The listing is now visible to users.' : 'The listing has been rejected.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to update listing status:', error);
      toast({ title: 'Action Failed', description: 'Could not update listing status.', variant: 'destructive' });
    }
  };

  const handleVerifyListing = async (listingId) => {
    try {
      await listingsAPI.update(listingId, { verified: true });
      toast({ title: 'Listing Verified', description: 'The listing has been marked as verified.' });
      loadData();
    } catch (error) {
      console.error('Failed to verify listing:', error);
      toast({ title: 'Action Failed', description: 'Could not verify listing.', variant: 'destructive' });
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await authAPI.verifyUser(userId, true);
      toast({ title: 'User Verified', description: 'The user now has a verified badge.' });
      loadData();
    } catch (error) {
      console.error('Failed to verify user:', error);
      toast({ title: 'Action Failed', description: 'Could not verify user.', variant: 'destructive' });
    }
  };

  const roleColors = {
    admin: 'bg-destructive text-destructive-foreground',
    owner: 'bg-primary text-primary-foreground',
    tenant: 'bg-secondary text-secondary-foreground',
    roommate_seeker: 'bg-muted text-muted-foreground',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage users, listings, and platform settings</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Fetching administrative records...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
                { label: 'Total Listings', value: stats.totalListings, icon: Home, color: 'text-primary' },
                { label: 'Pending Approval', value: stats.pendingApproval, icon: Clock, color: 'text-warning' },
                { label: 'Active Requests', value: stats.activeRequests, icon: MessageSquare, color: 'text-primary' },
              ].map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="pending">
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />Pending Listings ({pendingListings.length})
                </TabsTrigger>
                <TabsTrigger value="listings">All Listings</TabsTrigger>
                <TabsTrigger value="users">All Users</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="space-y-4">
                  {pendingListings.length > 0 ? pendingListings.map((listing) => (
                    <Card key={listing.id} className="card-elevated border-warning/30">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="badge-pending gap-1"><Clock className="w-3 h-3" />Pending Review</Badge>
                            </div>
                            <h3 className="font-semibold text-lg text-foreground mb-1">{listing.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{listing.location}, {listing.city}</p>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{listing.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-foreground">₹{listing.rent}/month</span>
                              <span className="text-muted-foreground">by {listing.ownerName || 'Unknown Owner'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="gap-1" onClick={() => handleListingAction(listing.id, 'approve')}><CheckCircle className="w-4 h-4" />Approve</Button>
                            <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleListingAction(listing.id, 'reject')}><XCircle className="w-4 h-4" />Reject</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
                      <p className="text-muted-foreground">No pending listings to review.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="listings">
                <div className="space-y-4">
                  {dbListings.length > 0 ? dbListings.map((listing) => (
                    <Card key={listing.id} className="card-elevated">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={listing.status === 'approved' ? 'badge-verified' : listing.status === 'pending' ? 'badge-pending' : 'bg-destructive text-destructive-foreground'}>
                                {listing.status}
                              </Badge>
                              {listing.verified && <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3" />Verified</Badge>}
                            </div>
                            <h3 className="font-semibold text-foreground">{listing.title}</h3>
                            <p className="text-muted-foreground text-sm">{listing.city} • ₹{listing.rent}/mo • {listing.ownerName || 'Unknown Owner'}</p>
                          </div>
                          <div className="flex gap-2">
                            {listing.status === 'approved' && !listing.verified && (
                              <Button size="sm" className="gap-1" onClick={() => handleVerifyListing(listing.id)}><CheckCircle className="w-4 h-4" />Verify</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12 text-muted-foreground">No listings exist on the platform.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="space-y-4">
                  {dbUsers.length > 0 ? dbUsers.map((u) => (
                    <Card key={u.id} className="card-elevated">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Users className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{u.name}</h3>
                                {u.verified && <CheckCircle className="w-4 h-4 text-success" />}
                              </div>
                              <p className="text-muted-foreground text-sm">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={roleColors[u.role]}>{u.role.replace('_', ' ')}</Badge>
                            {!u.verified && (
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleVerifyUser(u.id)}>
                                <UserCheck className="w-4 h-4" />Verify
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12 text-muted-foreground">No users registered on the platform.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
