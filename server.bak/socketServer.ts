const { Server } = require('socket.io');
const http = require('http');

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

interface SocketWithServer extends Socket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithServer;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Track active connections
const users = new Map();

const initializeSocketServer = async (req: NextApiRequest, res: NextApiResponse) => {
const initializeSocketServer = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket || !res.socket.server.io) {
    console.log('Socket.io server initializing...');
    // Express server
    const app = express();
    const server = createServer(app);
    
    // Socket.io server
    const io = new SocketIOServer(server, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Setup socket events
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Handle user authentication
      socket.on('authenticate', async (userData) => {
        try {
          // Update user's online status
          const user = await prisma.user.update({
            where: { id: userData.userId },
            data: {
              isOnline: true,
              lastSeen: new Date(),
            },
          });
          
          // Add user to active connections
          users.set(userData.userId, { socketId: socket.id, user });
          
          // Join user to appropriate rooms
          socket.join(`user:${userData.userId}`);
          
          if (userData.role === 'leader') {
            // Get groups led by the user
            const groups = await prisma.group.findMany({
              where: {
                leaders: {
                  some: {
                    id: userData.userId,
                  },
                },
              },
            });
            
            groups.forEach((group: any) => {
              socket.join(`group:${group.id}`);
            });
          }
          
          if (userData.role === 'parent') {
            // Get scouts of the parent
            const scouts = await prisma.scout.findMany({
              where: { parentId: userData.userId },
            });
            
            scouts.forEach((scout: any) => {
              socket.join(`scout:${scout.id}`);
              socket.join(`group:${scout.groupId}`);
            });
          }
          
          if (userData.role === 'executive') {
            // Executives can see everything
            socket.join('executives');
          }
          
          // Broadcast user status change
          io.emit('user_status_change', {
            userId: userData.userId,
            isOnline: true,
          });
          
          // Send list of online users
          socket.emit('online_users', Array.from(users.keys()));
          
        } catch (error) {
          console.error('Authentication error:', error);
        }
      });
      
      // Handle message
      socket.on('send_message', async (messageData) => {
        try {
          // Save message to database
          const message = await prisma.message.create({
            data: {
              content: messageData.content,
              senderId: messageData.senderId,
              receiverId: messageData.receiverId,
            },
          });
          
          // Emit to sender and receiver
          io.to(`user:${messageData.senderId}`).emit('receive_message', message);
          io.to(`user:${messageData.receiverId}`).emit('receive_message', message);
          
        } catch (error) {
          console.error('Message sending error:', error);
        }
      });
      
      // Handle event RSVP updates
      socket.on('update_event_rsvp', async (rsvpData) => {
        try {
          // Update attendance record
          const attendance = await prisma.attendance.upsert({
            where: {
              id: rsvpData.attendanceId || '0', // If no ID, create new
            },
            create: {
              scoutId: rsvpData.scoutId,
              userId: rsvpData.userId,
              eventId: rsvpData.eventId,
              status: rsvpData.status,
              date: new Date(),
            },
            update: {
              status: rsvpData.status,
            },
          });
          
          // Broadcast to group and parent
          io.to(`group:${rsvpData.groupId}`).emit('event_rsvp_updated', attendance);
          io.to(`user:${rsvpData.userId}`).emit('event_rsvp_updated', attendance);
          
        } catch (error) {
          console.error('RSVP update error:', error);
        }
      });
      
      // Handle scout progress updates
      socket.on('update_scout_progress', async (progressData) => {
        try {
          // Update achievement record
          const achievement = await prisma.achievement.create({
            data: {
              name: progressData.name,
              description: progressData.description,
              dateEarned: new Date(),
              scoutId: progressData.scoutId,
            },
          });
          
          // Broadcast to group, parent, and executives
          io.to(`scout:${progressData.scoutId}`).emit('scout_progress_updated', achievement);
          io.to(`group:${progressData.groupId}`).emit('scout_progress_updated', achievement);
          io.to(`executives`).emit('scout_progress_updated', achievement);
          
        } catch (error) {
          console.error('Progress update error:', error);
        }
      });
      
      // Handle document uploads
      socket.on('document_uploaded', async (documentData) => {
        try {
          // Create document record
          const document = await prisma.document.create({
            data: {
              title: documentData.title,
              fileUrl: documentData.fileUrl,
              fileType: documentData.fileType,
              description: documentData.description,
              uploadedBy: documentData.uploadedBy,
              type: documentData.type,
              size: documentData.size,
            },
          });
          
          // Broadcast to everyone or specific groups
          if (documentData.groupId) {
            io.to(`group:${documentData.groupId}`).emit('new_document', document);
          } else {
            io.emit('new_document', document);
          }
          
        } catch (error) {
          console.error('Document upload error:', error);
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', async () => {
        // Find user by socket ID
        let disconnectedUserId = null;
        
        for (const [userId, data] of users.entries()) {
          if (data.socketId === socket.id) {
            disconnectedUserId = userId;
            break;
          }
        }
        
        if (disconnectedUserId) {
          // Update user's online status
          await prisma.user.update({
            where: { id: disconnectedUserId },
            data: {
              isOnline: false,
              lastSeen: new Date(),
            },
          });
          
          // Remove user from active connections
          users.delete(disconnectedUserId);
          
          // Broadcast user status change
          io.emit('user_status_change', {
            userId: disconnectedUserId,
            isOnline: false,
          });
        }
        
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
    
    // Attach to the Next.js server
    if (res.socket) {
      res.socket.server.io = io;
    }
  }
  
  res.end();
};

module.exports = { initializeSocketServer };
