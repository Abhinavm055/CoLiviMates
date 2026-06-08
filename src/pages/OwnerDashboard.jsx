import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { listingsAPI, contactRequestsAPI } from '@/lib/api';
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
import { Plus, Home, MessageSquare, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, Mail, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [contactRequests, setContactRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listing creation form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [sharingType, setSharingType] = useState('single');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [facilities, setFacilities] = useState('');

  const fetchListings = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listingsAPI.getAll({ limit: 200 }); // Retrieve a large set to filter locally
      const filtered = data.listings.filter(l => l.owner_id === user.id);
      setMyListings(filtered);
    } catch (err) {
      console.error('Failed to load owner listings:', err);
      setError('Could not load your listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContactRequests = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    try {
      const data = await contactRequestsAPI.getOwnerRequests();
      setContactRequests(data.contactRequests);
    } catch (err) {
      console.error('Failed to load owner contact requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchContactRequests();
  }, [user]);

  if (!user || user.role !== 'owner') return <Navigate to="/auth" replace />;

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (parseInt(rent) <= 0) {
      toast({ title: 'Invalid Rent', description: 'Rent must be greater than 0.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const facilitiesArray = facilities ? facilities.split(',').map(f => f.trim()).filter(Boolean) : [];
      
      await listingsAPI.create({
        title,
        description,
        rent: parseInt(rent),
        sharing_type: sharingType,
        location,
        city,
        facilities: facilitiesArray,
        images: [], // Default empty array as expected
        available_from: new Date().toISOString().split('T')[0] // default to today
      });

      toast({ title: 'Listing Submitted!', description: 'Your listing is now live and pending review.' });
      setIsDialogOpen(false);
      
      // Clear form states
      setTitle('');
      setDescription('');
      setRent('');
      setSharingType('single');
      setLocation('');
      setCity('');
      setFacilities('');

      // Refresh listing items
      fetchListings();
    } catch (err) {
      console.error('Create listing error:', err);
      toast({ title: 'Failed to create listing', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsAPI.delete(listingId);
      toast({ title: 'Listing Deleted', description: 'The listing has been removed.' });
      fetchListings();
    } catch (err) {
      console.error('Delete listing error:', err);
      toast({ title: 'Delete Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    }
  };

  const stats = {
    total: myListings.length,
    approved: myListings.filter(l => l.status === 'approved').length,
    pending: myListings.filter(l => l.status === 'pending').length,
    requests: contactRequests.length,
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="badge-verified gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 'pending':
        return <Badge className="badge-pending gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />{status}</Badge>;
    }
  };

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

  const handleRequestStatusChange = async (requestId, newStatus) => {
    try {
      await contactRequestsAPI.updateStatus(requestId, newStatus);
      toast({ title: 'Status Updated', description: `Request marked as ${newStatus}.` });
      fetchContactRequests();
    } catch (err) {
      console.error('Failed to update request status:', err);
      toast({ title: 'Update Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and contact requests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" className="gap-2">
                <Plus className="w-4 h-4" />Add New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Listing</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateListing} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Cozy Room in Downtown" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your space..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent (₹)</Label>
                    <Input id="rent" type="number" placeholder="12000" value={rent} onChange={(e) => setRent(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={sharingType} onValueChange={setSharingType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Room</SelectItem>
                        <SelectItem value="double">Double Sharing</SelectItem>
                        <SelectItem value="triple">Triple Sharing</SelectItem>
                        <SelectItem value="dormitory">Dormitory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Locality</Label>
                    <Input id="location" placeholder="Koramangala 4th Block" value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities (comma separated)</Label>
                  <Input id="facilities" placeholder="WiFi, AC, Kitchen" value={facilities} onChange={(e) => setFacilities(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Listing'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/15 text-destructive rounded-xl mb-8 border border-destructive/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: stats.total, icon: Home },
            { label: 'Approved', value: stats.approved, icon: CheckCircle },
            { label: 'Pending', value: stats.pending, icon: Clock },
            { label: 'Requests', value: stats.requests, icon: MessageSquare },
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

        <Tabs defaultValue="listings">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <MessageSquare className="w-4 h-4" />Contact Requests ({contactRequests.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="listings">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Loading your properties...</p>
              </div>
            ) : myListings.length > 0 ? (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <Card key={listing.id} className="card-elevated">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {statusBadge(listing.status)}
                            {listing.verified && <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3" />Verified</Badge>}
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-1">{listing.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{listing.location}, {listing.city}</p>
                          <p className="text-foreground font-medium">₹{listing.rent.toLocaleString('en-IN')}/month</p>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/listings/${listing.id}`}>
                            <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" />View</Button>
                          </Link>
                          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleDeleteListing(listing.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No properties listed yet</h3>
                <p className="text-muted-foreground mb-6">List your room, PG, or hostel to start receiving tenant queries!</p>
                <Button variant="accent" onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />List Room Now
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="requests">
            {isLoadingRequests ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Loading contact requests...</p>
              </div>
            ) : contactRequests.length > 0 ? (
              <div className="space-y-4">
                {contactRequests.map((request) => (
                  <Card key={request.id} className="card-elevated">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {requestStatusBadge(request.status)}
                            <Badge variant="outline" className="gap-1">
                              <Home className="w-3 h-3" />
                              {request.listing_title}
                            </Badge>
                          </div>
                          
                          <div className="bg-muted/50 p-4 rounded-xl border border-border/30">
                            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">"{request.message}"</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-semibold text-foreground">Tenant:</span>
                              {request.tenant_name}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <a href={`mailto:${request.tenant_email}`} className="text-primary hover:underline">{request.tenant_email}</a>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
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

                        {request.status === 'pending' && (
                          <div className="flex gap-2 self-start md:self-center">
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleRequestStatusChange(request.id, 'accepted')}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRequestStatusChange(request.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No contact requests</h3>
                <p className="text-muted-foreground">When tenants inquire about your rooms, their messages will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
