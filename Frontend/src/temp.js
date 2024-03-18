import "./App.css";
import { useEffect,useState } from "react";
import io from "socket.io-client";
const socket = io.connect("http://localhost:4000");

function App() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const sendMessage = () => {
    if (currentMessage) {
      socket.emit('send', currentMessage);
      setCurrentMessage('');
    }
  };
  useEffect(() => {
    // Listen for incoming messages
    socket.on('res', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    socket.on('con',(message)=>{
      setMessages((prevMessages) => [...prevMessages, message]);
    })
  }, []);

  return (
    <div className="App">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      />      <button onClick={sendMessage}>Send message</button>
    </div>
  );
}

export default App;