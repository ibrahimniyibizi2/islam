import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Crown,
  Users,
  MonitorUp,
  StopCircle,
  MessageSquare,
  MoreHorizontal,
  Hand,
  ChevronRight,
  ChevronLeft,
  Circle,
  Square,
  Smile,
  Maximize,
} from 'lucide-react';

type Participant = {
  socketId: string;
  userId: string | null;
  name: string;
  isHost: boolean;
  joinedAt: string;
};

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  at: string;
};

function getRtcServerUrl() {
  const v = (import.meta as any).env?.VITE_RTC_SERVER_URL as string | undefined;
  return v || 'http://localhost:5050';
}

function getIceServers() {
  const turnUrl = (import.meta as any).env?.VITE_TURN_URL as string | undefined;
  const turnUser = (import.meta as any).env?.VITE_TURN_USERNAME as string | undefined;
  const turnPass = (import.meta as any).env?.VITE_TURN_PASSWORD as string | undefined;

  const servers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

  if (turnUrl && turnUser && turnPass) {
    servers.push({ urls: turnUrl, username: turnUser, credential: turnPass });
  }

  return servers;
}

export default function MeetingRoom() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const roomId = String(params.roomId || '').trim();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const name = String(query.get('name') || '').trim();
  const requestHost = query.get('host') === '1';

  const socketRef = useRef<Socket | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pcsInflightRef = useRef<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [selfSocketId, setSelfSocketId] = useState<string>('');
  const [hostSocketId, setHostSocketId] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'people' | 'chat'>('people');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  const isHost = selfSocketId && hostSocketId && selfSocketId === hostSocketId;

  const baseDashboard = role === 'imam' ? '/dashboard/imam' : '/dashboard/user';

  const cleanupPeer = useCallback((otherId: string) => {
    const pc = pcsRef.current.get(otherId);
    if (pc) {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch {}
      pcsRef.current.delete(otherId);
    }
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[otherId];
      return next;
    });
  }, []);

  const cleanupAll = useCallback(() => {
    for (const otherId of Array.from(pcsRef.current.keys())) {
      cleanupPeer(otherId);
    }
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch {}
      socketRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [cleanupPeer]);

  const ensureLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
      stream.getVideoTracks().forEach((t) => (t.enabled = camOn));
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play?.().catch(() => {});
      }
      return stream;
    } catch (err: any) {
      setMediaError(err?.message || 'Camera error');
      throw err;
    }
  }, [camOn, micOn]);

  const makePc = useCallback(
    async (otherId: string, initiator: boolean) => {
      const existing = pcsRef.current.get(otherId);
      if (existing) return existing;
      if (pcsInflightRef.current.has(otherId)) {
        while (pcsInflightRef.current.has(otherId)) {
          await new Promise((r) => setTimeout(r, 50));
        }
        return pcsRef.current.get(otherId) || null;
      }
      pcsInflightRef.current.add(otherId);
      try {
        const socket = socketRef.current;
        if (!socket) return null;
        const stream = await ensureLocalMedia();
        const pc = new RTCPeerConnection({ iceServers: getIceServers() });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.onicecandidate = (evt) => {
          if (!evt.candidate) return;
          socket.emit('signal:ice', { roomId, to: otherId, from: socket.id, candidate: evt.candidate });
        };
        pc.ontrack = (evt) => {
          const [remoteStream] = evt.streams;
          if (!remoteStream) return;
          setRemoteStreams((prev) => ({ ...prev, [otherId]: remoteStream }));
        };
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          if (state === 'failed' || state === 'disconnected' || state === 'closed') {
            cleanupPeer(otherId);
          }
        };
        pcsRef.current.set(otherId, pc);
        if (initiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal:offer', { roomId, to: otherId, from: socket.id, sdp: pc.localDescription });
        }
        return pc;
      } finally {
        pcsInflightRef.current.delete(otherId);
      }
    },
    [cleanupPeer, ensureLocalMedia, roomId]
  );

  const handleOffer = useCallback(
    async (payload: any) => {
      const from = String(payload?.from || '');
      const sdp = payload?.sdp;
      if (!from || !sdp) return;
      const pc = (await makePc(from, false)) as RTCPeerConnection | null;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit('signal:answer', { roomId, to: from, from: socketRef.current?.id, sdp: pc.localDescription });
    },
    [makePc, roomId]
  );

  const handleAnswer = useCallback(async (payload: any) => {
    const from = String(payload?.from || '');
    const sdp = payload?.sdp;
    if (!from || !sdp) return;
    const pc = pcsRef.current.get(from);
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }, []);

  const handleIce = useCallback(
    async (payload: any) => {
      const from = String(payload?.from || '');
      const candidate = payload?.candidate;
      if (!from || !candidate) return;
      const pc = pcsRef.current.get(from) || ((await makePc(from, false)) as RTCPeerConnection | null);
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    },
    [makePc]
  );

  useEffect(() => {
    if (!roomId) {
      navigate(`${baseDashboard}/meeting`);
      return;
    }
    if (!name) {
      navigate(`${baseDashboard}/meeting?room=${encodeURIComponent(roomId)}`);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        await ensureLocalMedia();
      } catch (e: any) {
        toast({ title: 'Camera Error', description: e?.message, variant: 'destructive' });
      }
      const socket = io(getRtcServerUrl(), { transports: ['websocket'] });
      socketRef.current = socket;
      socket.on('connect', () => {
        if (!mounted) return;
        setSelfSocketId(socket.id);
        setMeetingStartTime(new Date()); // Start timer when connected
        socket.emit(
          'room:join',
          { roomId, name, userId: user?.id || null, requestHost },
          async (res: any) => {
            if (!res?.ok) {
              toast({ title: 'Join Failed', description: res?.error, variant: 'destructive' });
              navigate(`${baseDashboard}/meeting?room=${encodeURIComponent(roomId)}`);
              return;
            }
            setHostSocketId(String(res.hostSocketId || ''));
            setParticipants(res.participants || []);
            const others: Participant[] = (res.participants || []).filter((p: Participant) => p.socketId !== socket.id);
            for (const p of others) {
              const initiator = socket.id < p.socketId;
              await makePc(p.socketId, initiator);
            }
          }
        );
      });
      socket.on('room:user-joined', async (evt: any) => {
        const list = evt?.participants || [];
        setParticipants(list);
        const joined = evt?.participant;
        const otherId = String(joined?.socketId || '');
        if (!otherId || otherId === socket.id) return;
        const initiator = socket.id < otherId;
        await makePc(otherId, initiator);
      });
      socket.on('room:user-left', (evt: any) => {
        const list = evt?.participants || [];
        setParticipants(list);
        const otherId = String(evt?.socketId || '');
        if (otherId) cleanupPeer(otherId);
      });
      socket.on('room:host-changed', (evt: any) => {
        setHostSocketId(String(evt?.hostSocketId || ''));
        setParticipants(evt?.participants || []);
      });
      socket.on('room:ended', () => {
        toast({ title: 'Meeting Ended', description: 'The host ended the meeting' });
        cleanupAll();
        navigate(`${baseDashboard}/meeting`);
      });
      socket.on('signal:offer', handleOffer);
      socket.on('signal:answer', handleAnswer);
      socket.on('signal:ice', handleIce);
      socket.on('chat:message', (msg: any) => {
        const sender = String(msg?.sender || '');
        const text = String(msg?.text || '');
        if (!text) return;
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: sender || 'User', text, at: new Date().toLocaleTimeString() }]);
      });
      socket.on('disconnect', () => {
        for (const otherId of Array.from(pcsRef.current.keys())) {
          cleanupPeer(otherId);
        }
        setParticipants([]);
        setHostSocketId('');
      });
    })();
    return () => {
      mounted = false;
      cleanupAll();
    };
  }, [baseDashboard, cleanupAll, cleanupPeer, ensureLocalMedia, handleAnswer, handleIce, handleOffer, makePc, name, navigate, requestHost, roomId, toast, user?.id]);

  // Meeting timer effect
  useEffect(() => {
    if (!meetingStartTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - meetingStartTime.getTime()) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      if (hours > 0) {
        setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [meetingStartTime]);

  const toggleMic = () => {
    setMicOn((prev) => {
      const newState = !prev;
      const s = localStreamRef.current;
      if (s) {
        s.getAudioTracks().forEach((t) => (t.enabled = newState));
      }
      return newState;
    });
  };

  const toggleCam = () => {
    setCamOn((prev) => {
      const newState = !prev;
      const s = localStreamRef.current;
      if (s) {
        s.getVideoTracks().forEach((t) => {
          if (newState) {
            // Start camera
            t.enabled = true;
          } else {
            // Stop camera completely to turn off light
            t.stop();
          }
        });
        
        // If turning camera back on, need to re-get the video track
        if (newState) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((newVideoStream) => {
              const videoTrack = newVideoStream.getVideoTracks()[0];
              if (videoTrack && s) {
                // Replace the stopped track with new one
                const senderUpdates: Promise<void>[] = [];
                for (const pc of pcsRef.current.values()) {
                  const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                  if (sender && sender.track) {
                    senderUpdates.push(sender.replaceTrack(videoTrack) as any);
                  }
                }
                Promise.all(senderUpdates);
                
                // Update local video element
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = s;
                }
              }
            })
            .catch((err) => {
              console.error('Failed to restart camera:', err);
              setCamOn(false);
            });
        }
      }
      return newState;
    });
  };

  const leave = async () => {
    try {
      await socketRef.current?.emitWithAck?.('room:leave', {});
    } catch {}
    cleanupAll();
    navigate(`${baseDashboard}/meeting`);
  };

  const endMeeting = async () => {
    if (!isHost) return;
    try {
      await socketRef.current?.emitWithAck?.('room:end', { roomId });
    } catch {}
    cleanupAll();
    navigate(`${baseDashboard}/meeting`);
  };

  const startScreenShare = async () => {
    try {
      const display = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      const track: MediaStreamTrack | undefined = display.getVideoTracks()[0];
      if (!track) return;
      const senderUpdates: Promise<void>[] = [];
      for (const pc of pcsRef.current.values()) {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) senderUpdates.push(sender.replaceTrack(track) as any);
      }
      await Promise.all(senderUpdates);
      setSharing(true);
      track.onended = async () => {
        await stopScreenShare();
      };
    } catch (e: any) {
      toast({ title: 'Screen Share Error', description: e?.message, variant: 'destructive' });
    }
  };

  const stopScreenShare = async () => {
    try {
      const local = localStreamRef.current;
      const camTrack = local?.getVideoTracks()[0];
      if (!camTrack) {
        setSharing(false);
        return;
      }
      const senderUpdates: Promise<void>[] = [];
      for (const pc of pcsRef.current.values()) {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) senderUpdates.push(sender.replaceTrack(camTrack) as any);
      }
      await Promise.all(senderUpdates);
    } finally {
      setSharing(false);
    }
  };

  const startRecording = () => {
    if (!localStreamRef.current) return;
    
    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(localStreamRef.current, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecordedChunks([]);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Collect data every second
    setIsRecording(true);
    
    toast({
      title: 'Recording Started',
      description: 'Your meeting is being recorded',
    });
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: 'Recording Stopped',
        description: 'Your recording has been downloaded',
      });
    }
  };
  
  const sendReaction = (emoji: string) => {
    setReaction(emoji);
    socketRef.current?.emit('reaction', { roomId, sender: name, emoji });
    setTimeout(() => setReaction(null), 2000);
    setShowReactions(false);
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    socketRef.current?.emit('chat:message', { roomId, sender: name, text });
    setChatInput('');
  };

  const allParticipants = useMemo(() => {
    const self: Participant = {
      socketId: selfSocketId || 'self',
      userId: user?.id || null,
      name: name || 'You',
      isHost,
      joinedAt: new Date().toISOString(),
    };
    return [self, ...participants.filter((p) => p.socketId !== selfSocketId)];
  }, [selfSocketId, user?.id, name, isHost, participants]);

  const totalParticipants = allParticipants.length;

  // Calculate grid layout based on participant count
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="h-screen flex flex-col bg-[#1f1f1f]">
      {/* Header - Teams Style */}
      <header className="h-14 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-[#3d3d3d]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#6264a7] flex items-center justify-center">
              <Video className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-white text-sm font-semibold">Meeting</h1>
              <p className="text-gray-400 text-xs">{roomId}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-[#3d3d3d]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm font-mono">{elapsedTime}</span>
          </div>
          <div className="h-6 w-px bg-[#3d3d3d]" />
          <div className="flex items-center gap-3">
            {isRecording && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-[#c50f1f] text-white text-xs rounded animate-pulse">
                <Circle className="h-2 w-2 fill-current" />
                REC
              </span>
            )}
            <span className="text-gray-300 text-sm">{totalParticipants} participants</span>
            {isHost && (
              <span className="px-2 py-0.5 bg-[#6264a7] text-white text-xs rounded">Host</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded hover:bg-[#3d3d3d] text-gray-300 transition-colors"
          >
            {showSidebar ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid Area */}
        <div className="flex-1 p-4 overflow-auto">
          {mediaError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Camera Error</h3>
                <p className="text-gray-400 mb-4">{mediaError}</p>
                <Button
                  onClick={async () => {
                    localStreamRef.current?.getTracks().forEach((t) => t.stop());
                    localStreamRef.current = null;
                    setLocalStream(null);
                    setMediaError(null);
                    try {
                      await ensureLocalMedia();
                    } catch {}
                  }}
                >
                  Retry Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className={`grid ${getGridClass(totalParticipants)} gap-3 h-full auto-rows-fr`}>
              {/* Self Video */}
              <VideoTile
                stream={localStream}
                name={name || 'You'}
                isSelf
                isHost={isHost}
                videoRef={localVideoRef}
                micOn={micOn}
                camOn={camOn}
                reaction={reaction}
              />

              {/* Remote Videos */}
              {participants
                .filter((p) => p.socketId !== selfSocketId)
                .map((p) => (
                  <VideoTile
                    key={p.socketId}
                    stream={remoteStreams[p.socketId] || null}
                    name={p.name}
                    isSelf={false}
                    isHost={p.isHost}
                    micOn={true}
                    camOn={true}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-80 bg-[#2d2d2d] border-l border-[#3d3d3d] flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-[#3d3d3d]">
              <button
                onClick={() => setActiveTab('people')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'people'
                    ? 'text-white border-b-2 border-[#6264a7] bg-[#3d3d3d]/50'
                    : 'text-gray-400 hover:text-white hover:bg-[#3d3d3d]/30'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  People ({totalParticipants})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-white border-b-2 border-[#6264a7] bg-[#3d3d3d]/50'
                    : 'text-gray-400 hover:text-white hover:bg-[#3d3d3d]/30'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </div>
              </button>
            </div>

            {/* People Panel */}
            {activeTab === 'people' && (
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                  {/* In Call Section */}
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">
                    In call ({totalParticipants})
                  </div>

                  {/* Self */}
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-[#3d3d3d] cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[#6264a7] flex items-center justify-center text-white text-sm font-medium">
                      {name?.charAt(0).toUpperCase() || 'Y'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{name || 'You'} {isHost && '(Host)'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!micOn && <MicOff className="h-3.5 w-3.5 text-red-400" />}
                      {!camOn && <VideoOff className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                  </div>

                  {/* Others */}
                  {participants
                    .filter((p) => p.socketId !== selfSocketId)
                    .map((p) => (
                      <div key={p.socketId} className="flex items-center gap-3 p-2 rounded hover:bg-[#3d3d3d] cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-[#616161] flex items-center justify-center text-white text-sm font-medium">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{p.name}</p>
                        </div>
                        {p.isHost && (
                          <span className="text-xs text-[#6264a7]">Host</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Chat Panel */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex flex-col ${m.sender === name ? 'items-end' : 'items-start'}`}>
                        <div className="text-xs text-gray-400 mb-0.5">{m.sender}</div>
                        <div
                          className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                            m.sender === name ? 'bg-[#6264a7] text-white' : 'bg-[#3d3d3d] text-white'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-0.5">{m.at}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-[#3d3d3d]">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                      className="bg-[#3d3d3d] border-[#4d4d4d] text-white placeholder:text-gray-500"
                    />
                    <Button onClick={sendChat} size="icon" className="bg-[#6264a7] hover:bg-[#515298]">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Control Bar - Teams Style */}
      <footer className="h-16 bg-[#2d2d2d] border-t border-[#3d3d3d] flex items-center justify-center gap-3 px-6">
        {/* Left - Mic & Camera */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              micOn ? 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]' : 'bg-[#c50f1f] text-white hover:bg-[#a10d1a]'
            }`}
            title={micOn ? 'Mute' : 'Unmute'}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              camOn ? 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]' : 'bg-[#c50f1f] text-white hover:bg-[#a10d1a]'
            }`}
            title={camOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </div>

        <div className="w-px h-8 bg-[#3d3d3d]" />

        {/* Center - Actions */}
        <div className="flex items-center gap-2">
          {/* Recording */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-[#c50f1f] text-white animate-pulse' 
                : 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5 fill-current" />}
          </button>

          <button
            onClick={sharing ? stopScreenShare : startScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              sharing ? 'bg-[#6264a7] text-white' : 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]'
            }`}
            title={sharing ? 'Stop sharing' : 'Share screen'}
          >
            {sharing ? <StopCircle className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
          </button>

          <button
            onClick={() => setHandRaised((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              handRaised ? 'bg-[#ffeb3b] text-black' : 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]'
            }`}
            title={handRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="h-5 w-5" />
          </button>

          {/* Reactions */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                showReactions ? 'bg-[#6264a7] text-white' : 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]'
              }`}
              title="Reactions"
            >
              <Smile className="h-5 w-5" />
            </button>
            {showReactions && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#2d2d2d] rounded-lg p-2 flex gap-1 shadow-xl border border-[#3d3d3d]">
                {['👍', '❤️', '😂', '😮', '👏', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="w-10 h-10 hover:bg-[#3d3d3d] rounded flex items-center justify-center text-xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-[#3d3d3d]" />

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showSidebar ? 'bg-[#6264a7] text-white' : 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]'
            }`}
            title="Show participants"
          >
            <Users className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setShowSidebar(true);
              setActiveTab('chat');
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showSidebar && activeTab === 'chat' ? 'bg-[#6264a7] text-white' : 'bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]'
            }`}
            title="Show chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          <button 
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="w-12 h-12 rounded-full bg-[#3d3d3d] text-white hover:bg-[#4d4d4d] flex items-center justify-center transition-all" 
            title="Fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-[#3d3d3d]" />

        {/* Right - Leave */}
        <button
          onClick={isHost ? endMeeting : leave}
          className="h-12 px-6 rounded-full bg-[#c50f1f] text-white font-semibold hover:bg-[#a10d1a] transition-all flex items-center gap-2"
        >
          <PhoneOff className="h-5 w-5" />
          {isHost ? 'End meeting' : 'Leave'}
        </button>
      </footer>
    </div>
  );
}

// Video Tile Component
function VideoTile({
  stream,
  name,
  isSelf,
  isHost,
  videoRef,
  micOn,
  camOn,
  reaction,
}: {
  stream: MediaStream | null;
  name: string;
  isSelf: boolean;
  isHost: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  micOn?: boolean;
  camOn?: boolean;
  reaction?: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const el = isSelf ? videoRef?.current : ref.current;
    if (!el) return;
    if (isSelf) el.muted = true;
    if (stream) {
      el.srcObject = stream;
      el.play?.().catch(() => {});
      setHasVideo(stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live'));
    }
    return () => {
      try {
        el.srcObject = null;
      } catch {}
    };
  }, [isSelf, videoRef, stream]);

  const showAvatar = !stream || (!hasVideo && isSelf) || (isSelf && !camOn) || (!isSelf && !stream);

  return (
    <div className="relative w-full h-full min-h-[200px] rounded-lg overflow-hidden bg-[#1f1f1f]">
      <video
        ref={isSelf ? videoRef : ref}
        autoPlay
        playsInline
        muted={isSelf}
        className="w-full h-full object-cover"
      />

      {/* Avatar / Placeholder */}
      {showAvatar && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2d2d2d]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-[#6264a7] flex items-center justify-center text-white text-3xl font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
            {!isSelf && !stream && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm">Connecting...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Name Badge */}
      <div className="absolute left-3 bottom-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-white text-sm font-medium">{name}</span>
        {isHost && <Crown className="h-3.5 w-3.5 text-amber-400" />}
      </div>

      {/* Reaction */}
      {reaction && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">
          {reaction}
        </div>
      )}

      {/* Mic Status */}
      {micOn === false && (
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#c50f1f] flex items-center justify-center">
          <MicOff className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
