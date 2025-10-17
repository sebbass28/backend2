import { Server } from 'socket.io';

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // in production, restrict to your domain
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // You can authenticate the socket by token (better to implement)
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      // console.log('socket disconnected', socket.id);
    });
  });

  // export a global reference (if you need to emit from controllers)
  global.io = io;
}