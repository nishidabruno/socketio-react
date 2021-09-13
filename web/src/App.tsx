import React, { useEffect, useState } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';
import { format } from 'date-fns';

import './App.css';

interface UserMessage {
  username: string;
  message: string;
  createdAt: string;
}

interface User {
  username: string;
  room: string;
}

function App() {
  const [room, setRoom] = useState('nodejs');
  const [username, setUsername] = useState('');

  // states after join
  const [socket, setSocket] = useState<Socket | null>(null);

  const [userInfo, setUserInfo] = useState<User>({} as User);
  const [messages, setMessages] = useState<UserMessage[]>([]);

  function handleConnection(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setUserInfo({ username, room });

    const socketIO = socketIOClient('http://localhost:3333');

    setSocket(socketIO);

    socketIO.emit('select_room', {
      room,
      username
    }, (response: UserMessage[]) => {
      setMessages(response);
    });
  }

  function handleDisconnection() {
    socket?.disconnect();
    setSocket(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {

    if (event.key === 'Enter') {
      const message = event.currentTarget.value;

      const data = {
        room,
        message,
        username
      };

      socket?.emit('message', data);

      event.currentTarget.value = '';
    }
  }

  useEffect(() => {
    socket?.on('message', data => {
      const messageData = {
        username: data.username,
        message: data.message,
        createdAt: format(new Date(data.createdAt), 'dd/MM/yyyy').toString()
      };

      setMessages(prev => [...prev, messageData]);
    });
  }, [socket]);

  return (
    <div className="container">
      {socket ? (
        <>
          <button onClick={handleDisconnection}>Logout</button>
          <h4>Hello, {userInfo.username}. {userInfo.room}</h4>
          <div className="messager-container">
            <input type="text" placeholder="message" onKeyDown={handleKeyDown} />
            <button>Send</button>
          </div>
          <div className="messages">
            {messages.map((item, index) => (
              <p key={index}>
                <strong>{item.username}</strong> - {item.createdAt}: {item.message}
              </p>
            ))}
          </div>
        </>
      ) : (
        <form>
          <select onChange={e => setRoom(e.currentTarget.value)}>
            <option value="nodejs">Node.js</option>
            <option value="reactjs">React.js</option>
            <option value="elixir">Elixir</option>
          </select>
          <input type="text" placeholder="Name" onChange={e => setUsername(e.currentTarget.value)} />

          <button onClick={handleConnection}>Connect</button>
        </form>
      )}

    </div>
  );
}

export default App;
