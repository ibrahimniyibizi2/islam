import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, MicOff, VideoOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

function randomRoomId() {
  const part = Math.random().toString(36).slice(2, 8);
  const part2 = Date.now().toString(36).slice(-6);
  return `${part}-${part2}`;
}

export default function MeetingLobby() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialRoom = query.get('room') || '';
  const initialName = query.get('name') || '';
  const initialHost = query.get('host') === '1';

  const [roomId, setRoomId] = useState(initialRoom);
  const [name, setName] = useState(initialName || (user?.user_metadata?.full_name as string) || user?.email || '');
  const [isHost, setIsHost] = useState(initialHost);

  const [previewing, setPreviewing] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!stream) {
      videoRef.current.srcObject = null;
      return;
    }
    videoRef.current.srcObject = stream;
  }, [stream]);

  const startPreview = async () => {
    try {
      setPreviewing(true);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: camOn,
        audio: micOn,
      });
      setStream(s);
    } catch (e: any) {
      toast({
        title: 'Camera/Mic Error',
        description: e?.message || 'Unable to access camera or microphone',
        variant: 'destructive',
      });
      setStream(null);
    } finally {
      setPreviewing(false);
    }
  };

  const toggleMic = () => {
    setMicOn((v) => !v);
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !micOn;
      });
    }
  };

  const toggleCam = () => {
    setCamOn((v) => !v);
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = !camOn;
      });
    }
  };

  const createRoom = () => {
    const id = randomRoomId();
    setRoomId(id);
    setIsHost(true);
    toast({
      title: 'Room Created',
      description: `Room ID: ${id}`,
    });
  };

  const goJoin = () => {
    const id = roomId.trim();
    const displayName = name.trim();

    if (!displayName) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name before joining',
        variant: 'destructive',
      });
      return;
    }

    if (!id) {
      toast({
        title: 'Room ID Required',
        description: 'Please enter a room ID or create a room',
        variant: 'destructive',
      });
      return;
    }

    const base = role === 'imam' ? '/dashboard/imam' : '/dashboard/user';
    navigate(`${base}/meeting/${encodeURIComponent(id)}?name=${encodeURIComponent(displayName)}&host=${isHost ? '1' : '0'}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Meeting</h2>
          <p className="text-muted-foreground">Preview your camera and join a room</p>
        </div>
        <Badge variant="outline">WebRTC</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Join Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Imam Abdul" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Room ID</label>
              <Input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Paste room ID" />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={createRoom}>
                <Video className="mr-2 h-4 w-4" />
                Create Room
              </Button>
              <Button className="flex-1" onClick={goJoin}>
                Join Meeting
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="host"
                type="checkbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
              />
              <label htmlFor="host" className="text-sm text-muted-foreground">
                I am the host
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Camera Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            </div>

            <div className="flex items-center gap-2">
              <Button variant={micOn ? 'outline' : 'destructive'} size="icon" onClick={toggleMic}>
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button variant={camOn ? 'outline' : 'destructive'} size="icon" onClick={toggleCam}>
                {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button variant="outline" className="flex-1" onClick={startPreview} disabled={previewing}>
                {previewing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                {stream ? 'Restart preview' : 'Start preview'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: Use Chrome/Edge for best WebRTC support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
