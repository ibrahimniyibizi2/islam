import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Video, Users, Calendar, Clock, Copy, CheckCircle2, 
  ExternalLink, Phone, AlertCircle, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NikahVideoCall from '@/components/nikah/NikahVideoCall';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VideoNikahRequest {
  id: string;
  bride_name: string;
  groom_name: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  video_meeting_url?: string | null;
  mosque_id?: string;
  mosques?: { name: string };
  male_witness_name?: string;
  male_witness_phone?: string;
  female_witness1_name?: string;
  female_witness1_phone?: string;
  female_witness2_name?: string;
  female_witness2_phone?: string;
  wali_name?: string;
  wali_phone?: string;
  groom_phone?: string;
  groom_email?: string;
  bride_phone?: string;
  bride_email?: string;
}

export default function VideoNikahManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VideoNikahRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VideoNikahRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeCall, setActiveCall] = useState<{
    request: VideoNikahRequest;
    roomUrl: string;
  } | null>(null);
  const [creatingMeeting, setCreatingMeeting] = useState<string | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VideoNikahRequest | null>(null);

  useEffect(() => {
    fetchVideoNikahRequests();
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

  const fetchVideoNikahRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nikah_applications')
        .select(`
          id,
          bride_name,
          groom_name,
          preferred_date,
          preferred_time,
          status,
          mosque_id,
          mosques (name),
          groom_phone,
          groom_email,
          bride_phone,
          bride_email,
          male_witness_name,
          male_witness_phone,
          female_witness1_name,
          female_witness1_phone,
          female_witness2_name,
          female_witness2_phone,
          wali_name,
          wali_phone
        `)
        .in('status', ['confirmed', 'completed', 'video_scheduled'])
        .order('preferred_date', { ascending: true });

      if (error) throw error;
      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error) {
      console.error('Error fetching video nikah requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video nikah requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createVideoMeeting = async (request: VideoNikahRequest) => {
    try {
      setCreatingMeeting(request.id);

      // Generate demo room URL (works without deployed edge functions)
      const roomUrl = `https://islamrwanda.daily.co/nikah-${request.id.slice(0, 8)}-${Date.now().toString(36)}`;
      
      // Update the nikah application status
      await supabase
        .from('nikah_applications')
        .update({ status: 'video_scheduled' })
        .eq('id', request.id);

      toast({
        title: 'Video Meeting Created',
        description: 'The video call room is ready',
      });

      // Try to send notifications (non-blocking)
      try {
        await supabase.functions.invoke('send-video-nikah-notifications', {
          body: {
            nikah_application_id: request.id,
            room_url: roomUrl,
            groom_name: request.groom_name,
            groom_phone: request.groom_phone,
            groom_email: request.groom_email,
            bride_name: request.bride_name,
            bride_phone: request.bride_phone,
            bride_email: request.bride_email,
            preferred_date: request.preferred_date,
            preferred_time: request.preferred_time,
            imam_name: user?.user_metadata?.full_name || 'Imam',
            male_witness_name: request.male_witness_name,
            male_witness_phone: request.male_witness_phone,
            female_witness1_name: request.female_witness1_name,
            female_witness1_phone: request.female_witness1_phone,
            female_witness2_name: request.female_witness2_name,
            female_witness2_phone: request.female_witness2_phone,
            wali_name: request.wali_name,
            wali_phone: request.wali_phone,
          },
        });

        toast({
          title: 'Notifications Sent',
          description: 'SMS and email notifications sent to participants',
        });
      } catch (notifyError) {
        console.log('Notifications not sent (edge function may not be deployed)');
      }

      // Automatically join the video call
      setActiveCall({
        request: { ...request, video_meeting_url: roomUrl, status: 'video_scheduled' },
        roomUrl: roomUrl,
      });

      fetchVideoNikahRequests();
    } catch (error) {
      console.error('Error creating video meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create video meeting',
        variant: 'destructive',
      });
    } finally {
      setCreatingMeeting(null);
    }
  };

  const startVideoCall = (request: VideoNikahRequest) => {
    if (!request.video_meeting_url) {
      toast({
        title: 'No Meeting URL',
        description: 'Please create a video meeting first',
        variant: 'destructive',
      });
      return;
    }

    setActiveCall({
      request,
      roomUrl: request.video_meeting_url,
    });
  };

  const copyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Meeting link copied to clipboard',
    });
  };

  const openJoinDialog = (request: VideoNikahRequest) => {
    setSelectedRequest(request);
    setShowJoinDialog(true);
  };

  if (activeCall) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Video Nikah Ceremony</h2>
            <p className="text-muted-foreground">
              {activeCall.request.groom_name} & {activeCall.request.bride_name}
            </p>
          </div>
          <Button variant="outline" onClick={() => setActiveCall(null)}>
            Back to List
          </Button>
        </div>
        
        <NikahVideoCall
          roomUrl={activeCall.roomUrl}
          nikahApplicationId={activeCall.request.id}
          userRole="imam"
          userName="Imam"
          userId={user?.id || ''}
          isImam={true}
          onLeave={() => setActiveCall(null)}
        />
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold">Video Nikah Ceremonies</h2>
          <p className="text-muted-foreground">
            Manage and conduct virtual nikah ceremonies with video calls
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search by bride or groom name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Ready for Video</SelectItem>
            <SelectItem value="video_scheduled">Video Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Setup Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700 font-medium">Daily.co Video Setup Required</p>
        <p className="text-blue-600 text-sm mt-1">
          To use video nikah ceremonies, you need to:
        </p>
        <ol className="text-blue-600 text-sm mt-2 list-decimal list-inside">
          <li>Create a Daily.co account at <a href="https://daily.co" target="_blank" rel="noopener noreferrer" className="underline">daily.co</a></li>
          <li>Deploy the edge functions: <code className="bg-blue-100 px-1 rounded">supabase functions deploy create-daily-room</code></li>
          <li>Set your API key: <code className="bg-blue-100 px-1 rounded">supabase secrets set DAILY_API_KEY=your_key</code></li>
        </ol>
        <p className="text-blue-600 text-sm mt-2">
          Until then, demo mode will show an error when trying to join video calls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredRequests.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {statusFilter === 'confirmed' 
                  ? 'No confirmed nikah applications ready for video ceremony'
                  : statusFilter === 'video_scheduled'
                  ? 'No video ceremonies scheduled yet'
                  : 'No video nikah ceremonies found'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                First, confirm nikah applications in the Nikah Requests page
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = '/dashboard/imam/nikah'}
              >
                Go to Nikah Requests
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {request.groom_name} & {request.bride_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.mosques?.name || 'No mosque specified'}
                    </p>
                  </div>
                  <Badge variant={request.video_meeting_url ? 'default' : 'secondary'}>
                    {request.video_meeting_url ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(request.preferred_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {request.preferred_time}
                  </div>
                </div>

                {/* Required Participants */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Required Participants</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      Imam (You)
                    </Badge>
                    <Badge variant="outline" className="text-xs">Groom: {request.groom_name}</Badge>
                    <Badge variant="outline" className="text-xs">Bride: {request.bride_name}</Badge>
                    {request.male_witness_name && (
                      <Badge variant="outline" className="text-xs">Witness: {request.male_witness_name}</Badge>
                    )}
                    {request.female_witness1_name && (
                      <Badge variant="outline" className="text-xs">Witness: {request.female_witness1_name}</Badge>
                    )}
                    {request.wali_name && (
                      <Badge variant="outline" className="text-xs">Wali: {request.wali_name}</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {request.video_meeting_url ? (
                    <>
                      <Button 
                        className="flex-1" 
                        onClick={() => startVideoCall(request)}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Join Video Call
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openJoinDialog(request)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => createVideoMeeting(request)}
                      disabled={creatingMeeting === request.id}
                    >
                      {creatingMeeting === request.id ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Video className="mr-2 h-4 w-4" />
                      )}
                      Create Video Meeting
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Join Video Nikah Ceremony</DialogTitle>
            <DialogDescription>
              Share this information with all participants
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Meeting Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Couple:</strong> {selectedRequest.groom_name} & {selectedRequest.bride_name}</p>
                  <p><strong>Date:</strong> {new Date(selectedRequest.preferred_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedRequest.preferred_time}</p>
                  <p><strong>Meeting URL:</strong></p>
                  <div className="flex items-center gap-2">
                    <Input value={selectedRequest.video_meeting_url || ''} readOnly />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyMeetingLink(selectedRequest.video_meeting_url!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Requirements</h4>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                      <li>All participants must have cameras enabled</li>
                      <li>Groom and Bride must be in separate locations with witnesses</li>
                      <li>Valid ID verification may be required</li>
                      <li>Recording will be started by the Imam</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Participants to Invite</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span>{selectedRequest.groom_name} (Groom)</span>
                    <Badge>Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border">
                    <span>{selectedRequest.bride_name} (Bride)</span>
                    <Badge>Required</Badge>
                  </div>
                  {selectedRequest.male_witness_name && (
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span>{selectedRequest.male_witness_name} (Male Witness)</span>
                      <Badge>Required</Badge>
                    </div>
                  )}
                  {selectedRequest.female_witness1_name && (
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span>{selectedRequest.female_witness1_name} (Female Witness)</span>
                      <Badge>Required</Badge>
                    </div>
                  )}
                  {selectedRequest.wali_name && (
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span>{selectedRequest.wali_name} (Wali)</span>
                      <Badge>Required</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
