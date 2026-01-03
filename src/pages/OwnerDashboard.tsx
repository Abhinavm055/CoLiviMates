import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { mockListings, mockContactRequests } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Home, MessageSquare, Eye, Edit, Trash2, 
  CheckCircle, Clock, XCircle, Mail, Calendar 
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Listing } from '@/types';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user || user.role !== 'owner') {
    return <Navigate to="/auth" replace />;
  }

  const myListings = mockListings.filter(l => l.ownerId === user.id || l.ownerId === '2');
  const myRequests = mockContactRequests.filter(r => r.toOwnerId === user.id || r.toOwnerId === '2');

  const stats = {
    total: myListings.length,
    approved: myListings.filter(l => l.status === 'approved').length,
    pending: myListings.filter(l => l.status === 'pending').length,
    requests: myRequests.length,
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    toast({
      title: 'Listing Submitted!',
      description: 'Your listing will be reviewed by our team before going live.',
    });
  };

  const handleDeleteListing = (listingId: string) => {
    toast({
      title: 'Listing Deleted',
      description: 'The listing has been removed.',
    });
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    toast({
      title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
      description: action === 'approve' 
        ? 'The tenant can now view your contact details.' 
        : 'The request has been declined.',
    });
  };

  const statusBadge = (status: Listing['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="badge-verified gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 'pending':
        return <Badge className="badge-pending gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
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
                <Plus className="w-4 h-4" />
                Add New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateListing} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Cozy Room in Downtown" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your space..." rows={3} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent ($)</Label>
                    <Input id="rent" type="number" placeholder="850" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sharingType">Room Type</Label>
                    <Select defaultValue="single">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                    <Label htmlFor="location">Address</Label>
                    <Input id="location" placeholder="123 Main St" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="New York" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities (comma separated)</Label>
                  <Input id="facilities" placeholder="WiFi, AC, Kitchen" />
                </div>
                <Button type="submit" className="w-full">Submit for Review</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
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

        {/* Tabs */}
        <Tabs defaultValue="listings">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="requests">Contact Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="space-y-4">
              {myListings.map((listing) => (
                <Card key={listing.id} className="card-elevated">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {statusBadge(listing.status)}
                          {listing.verified && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">{listing.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{listing.location}, {listing.city}</p>
                        <p className="text-foreground font-medium">${listing.rent}/month</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteListing(listing.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-4">
              {myRequests.length > 0 ? myRequests.map((request) => (
                <Card key={request.id} className="card-elevated">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="badge-pending">New Request</Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Request for: {request.listingTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.fromUserName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {request.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{request.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestAction(request.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Contact Requests</h3>
                  <p className="text-muted-foreground">When tenants request contact, they'll appear here.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
