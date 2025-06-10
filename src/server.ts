import http from 'http';
import app from './app';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// This should **initialize and hold open** the Socket.IO instance
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
