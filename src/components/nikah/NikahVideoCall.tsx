import { useEffect, useCallback, useState, useRef } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff, 
  Users, MessageSquare, ScreenShare, StopCircle,
  Copy, CheckCircle2, UserCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Participant {
  user_id: string;
  user_name: string;
  role: 'groom' | 'bride' | 'witness' | 'imam' | 'wali';
  audio: boolean;
  video: boolean;
  joined_at: string;
}

interface NikahVideoCallProps {
  roomUrl: string;
  nikahApplicationId: string;
  userRole: 'groom' | 'bride' | 'witness' | 'imam' | 'wali';
  userName: string;
  userId: string;
  onLeave?: () => void;
  isImam?: boolean;
}

export default function NikahVideoCall({ 
  roomUrl, 
  nikahApplicationId, 
  userRole, 
  userName, 
  userId,
  onLeave,
  isImam = false 
}: NikahVideoCallProps) {
  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Initialize Daily.co call
  useEffect(() => {
    // Prevent duplicate initialization
    if (!containerRef.current || callFrameRef.current) {
      console.log('DailyIframe already exists or container not ready');
      return;
    }

    // Check if there's already a Daily instance in this container
    const existingFrame = containerRef.current.querySelector('iframe');
    if (existingFrame) {
      console.log('Daily iframe already exists in container');
      return;
    }

    console.log('Creating new DailyIframe instance');
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '8px',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
      showLocalVideo: true,
      showParticipantsBar: false,
    });

    callFrameRef.current = callFrame;

    // Event listeners
    callFrame.on('joined-meeting', () => {
      setIsJoined(true);
      toast({
        title: 'Joined Nikah Ceremony',
        description: `You have joined as ${userRole}`,
      });
      
      // Log participant join to database
      logParticipantJoin();
    });

    callFrame.on('left-meeting', () => {
      setIsJoined(false);
      onLeave?.();
    });

    callFrame.on('participant-joined', (event) => {
      const participant = event.participant;
      const userData = (participant.userData || {}) as { role?: string };
      setParticipants(prev => [...prev, {
        user_id: participant.user_id || participant.session_id || '',
        user_name: participant.user_name || 'Anonymous',
        role: (userData.role as Participant['role']) || 'witness',
        audio: true,
        video: true,
        joined_at: new Date().toISOString(),
      }]);
    });

    callFrame.on('participant-left', (event) => {
      const participant = event.participant;
      setParticipants(prev => prev.filter(p => p.user_id !== (participant.user_id || participant.session_id)));
    });

    callFrame.on('error', (error) => {
      console.error('Daily.co error:', error);
      setJoinError(error.errorMsg || 'Failed to join video call');
      toast({
        title: 'Video Call Error',
        description: error.errorMsg || 'An error occurred in the video call',
        variant: 'destructive',
      });
    });

    // Join the room
    callFrame.join({
      url: roomUrl,
      userName: `${userName} (${userRole})`,
      userData: {
        role: userRole,
        userId: userId,
        nikahApplicationId: nikahApplicationId,
      },
    });

    return () => {
      console.log('Cleaning up DailyIframe');
      try {
        // Leave the meeting first
        callFrame.leave();
      } catch (e) {
        console.log('Error leaving frame:', e);
      }
      // Small delay before destroy to allow leave to complete
      setTimeout(() => {
        try {
          callFrame.destroy();
        } catch (e) {
          console.log('Error destroying frame:', e);
        }
        callFrameRef.current = null;
      }, 100);
    };
  }, [roomUrl, userName, userRole, userId, nikahApplicationId, onLeave, toast]);

  // Call duration timer
  useEffect(() => {
    if (!isJoined) return;
    
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isJoined]);

  const logParticipantJoin = async () => {
    // Video call logging - can be extended when columns are added to database
    console.log('Participant joined nikah video call:', nikahApplicationId, userId, userRole);
  };

  const toggleAudio = useCallback(() => {
    if (!callFrameRef.current) return;
    
    if (isAudioEnabled) {
      callFrameRef.current.setLocalAudio(false);
    } else {
      callFrameRef.current.setLocalAudio(true);
    }
    setIsAudioEnabled(!isAudioEnabled);
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (!callFrameRef.current) return;
    
    if (isVideoEnabled) {
      callFrameRef.current.setLocalVideo(false);
    } else {
      callFrameRef.current.setLocalVideo(true);
    }
    setIsVideoEnabled(!isVideoEnabled);
  }, [isVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    if (!callFrameRef.current) return;
    
    try {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await callFrameRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast({
        title: 'Screen Share Error',
        description: 'Failed to share screen',
        variant: 'destructive',
      });
    }
  }, [isScreenSharing, toast]);

  const leaveCall = useCallback(() => {
    if (!callFrameRef.current) return;
    
    callFrameRef.current.leave();
    logParticipantLeave();
  }, []);

  const logParticipantLeave = async () => {
    // Video call logging - can be extended when columns are added to database
    console.log('Participant left nikah video call:', nikahApplicationId, userId, userRole);
  };

  const toggleRecording = useCallback(async () => {
    if (!callFrameRef.current || !isImam) return;
    
    try {
      if (isRecording) {
        await callFrameRef.current.stopRecording();
        setIsRecording(false);
        toast({
          title: 'Recording Stopped',
          description: 'The nikah ceremony recording has been saved',
        });
      } else {
        await callFrameRef.current.startRecording();
        setIsRecording(true);
        toast({
          title: 'Recording Started',
          description: 'The nikah ceremony is now being recorded',
        });
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to toggle recording',
        variant: 'destructive',
      });
    }
  }, [isRecording, isImam, toast]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !callFrameRef.current) return;
    
    callFrameRef.current.sendAppMessage({
      message: newMessage,
      sender: userName,
      role: userRole,
    }, '*');
    
    setMessages(prev => [...prev, {
      sender: userName,
      text: newMessage,
      time: new Date().toLocaleTimeString(),
    }]);
    setNewMessage('');
  }, [newMessage, userName, userRole]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomUrl);
    toast({
      title: 'Link Copied',
      description: 'Meeting link copied to clipboard',
    });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col gap-4">
      {/* Error Display */}
      {joinError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Video Call Error</p>
          <p className="text-red-600 text-sm">{joinError}</p>
          <p className="text-red-600 text-sm mt-2">
            The video room may not exist. Please ensure the Daily.co edge function is deployed or use a valid room URL.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Video Call Container */}
      <div className="relative flex-1 rounded-lg overflow-hidden bg-black">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {formatDuration(callDuration)}
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                REC
              </Badge>
            )}
          </div>
          
          {isImam && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={copyRoomLink}
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
            </div>
          )}
        </div>

        {/* Required Participants Status */}
        <div className="absolute top-16 left-4">
          <Card className="bg-black/70 border-0">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-white mb-2">Required Participants</p>
              <div className="space-y-1">
                {['imam', 'groom', 'bride', 'witness'].map((role) => {
                  const isPresent = participants.some(p => p.role === role || (role === 'witness' && (p.role === 'witness' || p.role === 'wali')));
                  return (
                    <div key={role} className="flex items-center gap-2 text-xs">
                      {isPresent ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-white/50" />
                      )}
                      <span className={isPresent ? 'text-green-400' : 'text-white/70'}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isAudioEnabled ? 'default' : 'destructive'}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? 'default' : 'destructive'}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'outline'}
            size="icon"
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <StopCircle className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
          </Button>

          {isImam && (
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={toggleRecording}
            >
              <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowParticipants(!showParticipants)}
            className={showParticipants ? 'bg-accent' : ''}
          >
            <Users className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'bg-accent' : ''}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          
          <Button
            variant="destructive"
            onClick={leaveCall}
            className="gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            End Call
          </Button>
        </div>
      </div>

      {/* Side Panel - Participants or Chat */}
      {(showParticipants || showChat) && (
        <Card className="w-full h-48">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">
              {showParticipants ? 'Participants' : 'Chat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-32 overflow-auto">
            {showParticipants ? (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{p.user_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {p.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {p.audio ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-muted-foreground" />}
                      {p.video ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground ml-2">{msg.time}</span>
                    <p className="text-muted-foreground">{msg.text}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </div>
            )}
          </CardContent>
          {showChat && (
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border border-input px-3 py-1 text-sm"
                />
                <Button size="sm" onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
