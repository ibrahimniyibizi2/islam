import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

/**
 * rooms: Map<roomId, {
 *   hostSocketId: string,
 *   participants: Map<socketId, { socketId, userId, name, isHost, joinedAt }>
 * }>
 */
const rooms = new Map();

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function serializeParticipants(room) {
  return Array.from(room.participants.values()).map((p) => ({
    socketId: p.socketId,
    userId: p.userId,
    name: p.name,
    isHost: p.isHost,
    joinedAt: p.joinedAt,
  }));
}

function ensureRoom(roomId, hostSocketId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      hostSocketId,
      participants: new Map(),
    };
    rooms.set(roomId, room);
  }
  return room;
}

io.on('connection', (socket) => {
  socket.on('room:join', (payload, ack) => {
    try {
      const roomId = String(payload?.roomId || '').trim();
      const name = String(payload?.name || '').trim();
      const userId = payload?.userId ? String(payload.userId) : null;
      const requestHost = Boolean(payload?.requestHost);

      if (!roomId) {
        ack?.({ ok: false, error: 'roomId_required' });
        return;
      }
      if (!name) {
        ack?.({ ok: false, error: 'name_required' });
        return;
      }

      const existingRoom = getRoom(roomId);
      const isHost = !existingRoom ? true : requestHost === true && existingRoom.hostSocketId === socket.id;

      const room = ensureRoom(roomId, existingRoom ? existingRoom.hostSocketId : socket.id);
      if (!existingRoom) {
        room.hostSocketId = socket.id;
      }

      room.participants.set(socket.id, {
        socketId: socket.id,
        userId,
        name,
        isHost: room.hostSocketId === socket.id,
        joinedAt: new Date().toISOString(),
      });

      socket.join(roomId);
      socket.data.roomId = roomId;

      const participants = serializeParticipants(room);

      socket.to(roomId).emit('room:user-joined', {
        roomId,
        participant: room.participants.get(socket.id),
        participants,
      });

      ack?.({
        ok: true,
        roomId,
        self: room.participants.get(socket.id),
        hostSocketId: room.hostSocketId,
        participants,
      });
    } catch (e) {
      ack?.({ ok: false, error: 'join_failed' });
    }
  });

  socket.on('room:leave', (_payload, ack) => {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        ack?.({ ok: true });
        return;
      }
      const room = getRoom(roomId);
      if (!room) {
        socket.data.roomId = undefined;
        ack?.({ ok: true });
        return;
      }

      const leaving = room.participants.get(socket.id) || null;
      room.participants.delete(socket.id);
      socket.leave(roomId);
      socket.data.roomId = undefined;

      const participants = serializeParticipants(room);

      socket.to(roomId).emit('room:user-left', {
        roomId,
        socketId: socket.id,
        participant: leaving,
        participants,
      });

      if (room.hostSocketId === socket.id) {
        if (room.participants.size === 0) {
          rooms.delete(roomId);
        } else {
          const nextHost = room.participants.values().next().value;
          room.hostSocketId = nextHost.socketId;
          room.participants.set(nextHost.socketId, {
            ...nextHost,
            isHost: true,
          });
          socket.to(roomId).emit('room:host-changed', {
            roomId,
            hostSocketId: room.hostSocketId,
            participants: serializeParticipants(room),
          });
        }
      }

      ack?.({ ok: true });
    } catch (e) {
      ack?.({ ok: false, error: 'leave_failed' });
    }
  });

  socket.on('room:end', (payload, ack) => {
    try {
      const roomId = String(payload?.roomId || socket.data.roomId || '').trim();
      if (!roomId) {
        ack?.({ ok: false, error: 'roomId_required' });
        return;
      }
      const room = getRoom(roomId);
      if (!room) {
        ack?.({ ok: true });
        return;
      }
      if (room.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: 'not_host' });
        return;
      }

      io.to(roomId).emit('room:ended', { roomId, endedBy: socket.id });

      for (const participant of room.participants.values()) {
        const s = io.sockets.sockets.get(participant.socketId);
        if (s) {
          s.leave(roomId);
          s.data.roomId = undefined;
        }
      }

      rooms.delete(roomId);
      ack?.({ ok: true });
    } catch (e) {
      ack?.({ ok: false, error: 'end_failed' });
    }
  });

  socket.on('signal:offer', (payload) => {
    const { roomId, to, from, sdp } = payload || {};
    if (!roomId || !to || !sdp) return;
    io.to(String(to)).emit('signal:offer', {
      roomId: String(roomId),
      to: String(to),
      from: from ? String(from) : socket.id,
      sdp,
    });
  });

  socket.on('signal:answer', (payload) => {
    const { roomId, to, from, sdp } = payload || {};
    if (!roomId || !to || !sdp) return;
    io.to(String(to)).emit('signal:answer', {
      roomId: String(roomId),
      to: String(to),
      from: from ? String(from) : socket.id,
      sdp,
    });
  });

  socket.on('signal:ice', (payload) => {
    const { roomId, to, from, candidate } = payload || {};
    if (!roomId || !to || !candidate) return;
    io.to(String(to)).emit('signal:ice', {
      roomId: String(roomId),
      to: String(to),
      from: from ? String(from) : socket.id,
      candidate,
    });
  });

  socket.on('chat:message', (payload) => {
    const roomId = String(payload?.roomId || socket.data.roomId || '').trim();
    const sender = String(payload?.sender || '').trim();
    const text = String(payload?.text || '').trim();

    if (!roomId || !text) return;

    const room = getRoom(roomId);
    if (!room || !room.participants.has(socket.id)) return;

    io.to(roomId).emit('chat:message', {
      roomId,
      sender: sender || 'User',
      text,
      at: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = getRoom(roomId);
    if (!room) return;

    const leaving = room.participants.get(socket.id) || null;
    room.participants.delete(socket.id);

    const participants = serializeParticipants(room);
    socket.to(roomId).emit('room:user-left', {
      roomId,
      socketId: socket.id,
      participant: leaving,
      participants,
    });

    if (room.hostSocketId === socket.id) {
      if (room.participants.size === 0) {
        rooms.delete(roomId);
      } else {
        const nextHost = room.participants.values().next().value;
        room.hostSocketId = nextHost.socketId;
        room.participants.set(nextHost.socketId, {
          ...nextHost,
          isHost: true,
        });
        socket.to(roomId).emit('room:host-changed', {
          roomId,
          hostSocketId: room.hostSocketId,
          participants: serializeParticipants(room),
        });
      }
    }
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5050;
server.listen(PORT, () => {
  console.log(`RTC signaling server listening on http://localhost:${PORT}`);
});
