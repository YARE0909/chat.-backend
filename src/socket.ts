import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!);
      (socket as any).user = user;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', (socket as any).user.email);
    socket.on('message', (msg) => {
      console.log('Message received:', msg);
      socket.broadcast.emit('message', msg);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
