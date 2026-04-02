import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Heart, Search, CheckCircle, XCircle, Eye, Calendar, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NikahRequest {
  id: string;
  bride_name: string;
  groom_name: string;
  bride_father_name: string;
  groom_father_name: string;
  preferred_date: string;
  preferred_time: string;
  mosque_id: string;
  status: string;
  notes?: string;
  created_at: string;
  user_id: string;
  mosques?: { name: string };
}

export default function ImamNikah() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<NikahRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<NikahRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<NikahRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'cancel' | null>(null);

  useEffect(() => {
    fetchNikahRequests();
  }, [user]);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.bride_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.groom_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter]);

  const fetchNikahRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nikah_applications')
        .select(`
          *,
          mosques (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        status: item.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      }));
      setRequests(formattedData);
      setFilteredRequests(formattedData);
    } catch (error) {
      console.error('Error fetching nikah requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load nikah requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !actionType) return;

    const newStatus = actionType === 'confirm' ? 'confirmed' : 'cancelled';

    try {
      const { error } = await supabase
        .from('nikah_applications')
        .update({ status: newStatus })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Nikah request ${newStatus} successfully`,
      });

      fetchNikahRequests();
      setActionDialogOpen(false);
      setSelectedRequest(null);
      setActionType(null);
    } catch (error) {
      console.error('Error updating nikah status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const openActionDialog = (request: NikahRequest, action: 'confirm' | 'cancel') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const openViewDialog = (request: NikahRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      confirmed: 'bg-green-100 text-green-800 hover:bg-green-100',
      completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nikah Requests</h2>
          <p className="text-muted-foreground">Manage and review nikah applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium">{requests.filter((r) => r.status === 'pending').length} Pending</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by bride or groom name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="py-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No nikah requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {request.bride_name} & {request.groom_name}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(request.preferred_date).toLocaleDateString()} at {request.preferred_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {request.mosques?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(request)}>
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => openActionDialog(request, 'confirm')}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => openActionDialog(request, 'cancel')}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nikah Request Details</DialogTitle>
            <DialogDescription>Complete information about this nikah application</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bride&apos;s Name</p>
                  <p className="text-sm">{selectedRequest.bride_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Groom&apos;s Name</p>
                  <p className="text-sm">{selectedRequest.groom_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bride&apos;s Father</p>
                  <p className="text-sm">{selectedRequest.bride_father_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Groom&apos;s Father</p>
                  <p className="text-sm">{selectedRequest.groom_father_name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Date & Time</p>
                <p className="text-sm">
                  {new Date(selectedRequest.preferred_date).toLocaleDateString()} at{' '}
                  {selectedRequest.preferred_time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mosque</p>
                <p className="text-sm">{selectedRequest.mosques?.name || 'Not specified'}</p>
              </div>
              {selectedRequest.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this nikah request?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'confirm' ? 'default' : 'destructive'}
              onClick={handleStatusUpdate}
            >
              {actionType === 'confirm' ? 'Confirm' : 'Cancel'} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
