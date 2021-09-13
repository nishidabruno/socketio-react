import { io } from './http';

interface RoomUser {
  socket_id: string;
  username: string;
  room: string;
}

interface Message {
  room: string;
  message: string;
  username: string;
  createdAt: Date;
}

type LoginEmittedData = Omit<RoomUser, 'socket_id'>;

const users: RoomUser[] = [];

const messages: Message[] = [];

io.on('connection', socket => {

  socket.on('select_room', (data, callback) => {
    const { room, username } = data as LoginEmittedData;

    socket.join(room);

    const userInRoom = users.find(user => user.username === username && user.room === room);

    if (userInRoom) {
      userInRoom.socket_id = socket.id;
      return;
    }

    users.push({
      socket_id: socket.id,
      room,
      username
    });

    const messagesRoom = getRoomMessages(room);
    callback(messagesRoom);
  });

  socket.on('message', data => {
    const { room, message, username } = data as Message;

    const userMessage: Message = {
      room,
      message,
      username,
      createdAt: new Date()
    }

    messages.push(userMessage);

    io.to(room).emit('message', userMessage);
  })

});

function getRoomMessages(room: string) {
  const roomMessages = messages.filter(message => message.room === room);
  return roomMessages;
}
