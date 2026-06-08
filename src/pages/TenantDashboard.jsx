import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { roommateRequestsAPI, contactRequestsAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Users, Heart, MessageSquare, Edit, Trash2, MapPin, Loader2, AlertCircle, Mail, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export default function TenantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [myRoommateRequests, setMyRoommateRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myContactRequests, setMyContactRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [sharingType, setSharingType] = useState('double');
  const [preferredLocation, setPreferredLocation] = useState('');

  const fetchMyRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await roommateRequestsAPI.getAll({ limit: 200 });
      const filtered = data.roommateRequests.filter(r => r.user_id === user.id);
      
      // Map to camelCase
      const mapped = filtered.map(r => ({
        ...r,
        sharingType: r.sharing_type,
        preferredLocation: r.preferred_location,
        userName: r.user_name,
        createdAt: r.created_at ? new Date(r.created_at) : new Date()
      }));

      setMyRoommateRequests(mapped);
    } catch (err) {
      console.error('Failed to fetch roommate requests:', err);
      setError('Could not load roommate requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyContactRequests = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    try {
      const data = await contactRequestsAPI.getTenantRequests();
      setMyContactRequests(data.contactRequests);
    } catch (err) {
      console.error('Failed to fetch contact requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    fetchMyContactRequests();
  }, [user]);

  const requestStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge className="badge-verified gap-1"><CheckCircle className="w-3 h-3" />Accepted</Badge>;
      case 'pending':
        return <Badge className="badge-pending gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="gap-1">{status}</Badge>;
    }
  };

  if (!user || (user.role !== 'tenant' && user.role !== 'roommate_seeker')) return <Navigate to="/auth" replace />;

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (parseInt(budget) <= 0) {
      toast({ title: 'Invalid Budget', description: 'Budget must be greater than 0.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await roommateRequestsAPI.create({
        title,
        description,
        budget: parseInt(budget),
        sharing_type: sharingType,
        preferred_location: preferredLocation
      });

      toast({ title: 'Request Posted!', description: 'Your roommate request is now visible to others.' });
      setIsDialogOpen(false);

      // Reset form states
      setTitle('');
      setDescription('');
      setBudget('');
      setSharingType('double');
      setPreferredLocation('');

      fetchMyRequests();
    } catch (err) {
      console.error('Create request error:', err);
      toast({ title: 'Post Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await roommateRequestsAPI.delete(requestId);
      toast({ title: 'Request Deleted', description: 'Your roommate request has been removed.' });
      fetchMyRequests();
    } catch (err) {
      console.error('Delete request error:', err);
      toast({ title: 'Delete Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    }
  };

  const savedListings = [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {user.role === 'roommate_seeker' ? 'Roommate Seeker Dashboard' : 'Tenant Dashboard'}
            </h1>
            <p className="text-muted-foreground">Find rooms and connect with roommates</p>
          </div>
          <div className="flex gap-3">
            <Link to="/listings"><Button variant="outline" className="gap-2"><Search className="w-4 h-4" />Browse Rooms</Button></Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="accent" className="gap-2"><Plus className="w-4 h-4" />Post Roommate Request</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Find a Roommate</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Looking for Female Roommate..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Tell others about yourself and what you're looking for..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input id="budget" type="number" placeholder="10000" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Type</Label>
                      <Select value={sharingType} onValueChange={setSharingType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Room</SelectItem>
                          <SelectItem value="double">Double Sharing</SelectItem>
                          <SelectItem value="triple">Triple Sharing</SelectItem>
                          <SelectItem value="dormitory">Dorm Style</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Input id="location" placeholder="Koramangala, Bengaluru" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting...</> : 'Post Request'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/15 text-destructive rounded-xl mb-8 border border-destructive/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Saved Listings', value: savedListings.length, icon: Heart },
            { label: 'My Requests', value: myRoommateRequests.length, icon: Users },
            { label: 'Contact Requests', value: myContactRequests.length, icon: MessageSquare },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">My Roommate Requests</TabsTrigger>
            <TabsTrigger value="saved">Saved Listings</TabsTrigger>
            <TabsTrigger value="contact-requests" className="gap-2">
              <MessageSquare className="w-4 h-4" />My Contact Requests ({myContactRequests.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm font-medium">Fetching your requests...</p>
              </div>
            ) : myRoommateRequests.length > 0 ? (
              <div className="space-y-4">
                {myRoommateRequests.map((request) => (
                  <Card key={request.id} className="card-elevated">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={request.status === 'active' ? 'badge-verified' : 'bg-muted text-muted-foreground'}>
                              {request.status === 'active' ? 'Active' : 'Closed'}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-2">{request.title}</h3>
                          <p className="text-muted-foreground mb-4">{request.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-muted-foreground">Budget: ₹{request.budget.toLocaleString('en-IN')}/mo</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4 text-primary" />
                              {request.preferredLocation}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleDeleteRequest(request.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Roommate Requests</h3>
                <p className="text-muted-foreground mb-4">Post a request to find compatible roommates.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Post Request</Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="saved">
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Listings</h3>
              <p className="text-muted-foreground mb-4">Browse listings and save the ones you like.</p>
              <Link to="/listings"><Button className="gap-2"><Search className="w-4 h-4" />Browse Listings</Button></Link>
            </div>
          </TabsContent>
          <TabsContent value="contact-requests">
            {isLoadingRequests ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm font-medium">Fetching your contact requests...</p>
              </div>
            ) : myContactRequests.length > 0 ? (
              <div className="space-y-4">
                {myContactRequests.map((request) => (
                  <Card key={request.id} className="card-elevated">
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {request.listing_title}
                          </h3>
                          {requestStatusBadge(request.status)}
                        </div>

                        <div className="bg-muted/50 p-4 rounded-xl border border-border/30">
                          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">"{request.message}"</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground">Owner:</span> {request.owner_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${request.owner_email}`} className="text-primary hover:underline">{request.owner_email}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Contact Requests Sent</h3>
                <p className="text-muted-foreground mb-4">Inquire about room listings to connect with owners.</p>
                <Link to="/listings"><Button className="gap-2"><Search className="w-4 h-4" />Browse Listings</Button></Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
