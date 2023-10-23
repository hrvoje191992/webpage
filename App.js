import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userName, setUserName] = useState('Hello User');
  const [showMenu, setShowMenu] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [unhandledMessage, setUnhandledMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [sessionName, setSessionName] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const handleNewChat = () => {
    if (chatMessages.length > 0) {
      // If there are chat messages, save the chat session
      const newChatSession = { name: sessionName || 'Unnamed Session', messages: chatMessages };
      setChatSessions([...chatSessions, newChatSession]);
    }

    setChatMessages([]); // Clear the chat messages
    setCurrentMessage('');
    setShowSidebar(false); // Hide the sidebar
    setSessionName(''); // Clear the session name
    setSelectedSession(null); // Clear the selected session
  };

  const handleLoadSession = (session) => {
    // Load and set the selected chat session's messages
    setSelectedSession(session);

    // Clear the current chat messages
    setChatMessages([]);

    // Load the messages from the selected session
    session.messages.forEach((message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const newMessage = { type: 'user', text: currentMessage.trim() };
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      setCurrentMessage('');

      try {
        const response = await axios.post('http://127.0.0.1:5002/get-response', {
          message: newMessage.text,
        });

        if (response.data && response.data.message === 'unhandled') {
          setUnhandledMessage(newMessage.text);
          setShowConsent(true);
        } else if (response.data && response.data.message) {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { type: 'bot', text: response.data.message },
          ]);
        }
      } catch (error) {
        console.error('Error fetching the bot response', error);
      }
    }
  };

  const handleConsentResponse = async (consent) => {
    setShowConsent(false);
    if (consent) {
      await saveUnhandledMessage(unhandledMessage);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Thank you! Your message will be used for improvement.' },
      ]);
    } else {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: "Understood! Your message won't be saved." },
      ]);
    }
  };

  const saveUnhandledMessage = async (message) => {
    try {
      await axios.post('http://127.0.0.1:5002/save-message', {
        message: message,
      });
    } catch (error) {
      console.error('Error saving the message', error);
    }
  };

  const handleExit = () => {
    setShowSidebar(false); // Hide only the sidebar
  };

  const handleEnterChat = () => {
    setShowChat(true);
  };

  return (
    <div className="app">
      {showChat && (
    <div className="header">
      <button onClick={() => setShowSidebar(!showSidebar)}>
        {showSidebar ? 'Hide History' : 'Show History'}
      </button>
      <div className="profile">
        <div className="profile-icon"></div> {userName}
      </div>
      <div className="menu">
        <button className="hamburger" onClick={() => setShowMenu(!showMenu)}>☰</button>
        {showMenu && (
          <div className="dropdown">
            <button onClick={() => console.log('Login')}>Login</button>
            <button onClick={() => console.log('Register')}>Register</button>
            <button onClick={() => console.log('Feedback')}>Feedback</button>
          </div>
        )}
      </div>
    </div>
  )}

      {showChat && (
        <div className="chatWindow">
          <div className="chatMessages">
            {!showSidebar && chatMessages.map((message, index) => (
              <div key={index} className={`chatMessage ${message.type}`}>
                {message.text}
              </div>
            ))}
            {showConsent && (
              <div className="consent">
                <p>Can we save your question to improve our service?</p>
                <button onClick={() => handleConsentResponse(true)}>Yes</button>
                <button onClick={() => handleConsentResponse(false)}>No</button>
              </div>
            )}
          </div>
          <div className="chatControls">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {showSidebar && (
        <div className="sidebar">
          <h2>Chat History</h2>
          {selectedSession ? (
            // Display the messages from the selected session
            selectedSession.messages.map((message, index) => (
              <div key={index} className={`chatMessage ${message.type}`}>
                {message.text}
              </div>
            ))
          ) : (
            // Display the messages from the current chat session
            chatMessages.map((message, index) => (
              <div key={index} className={`chatMessage ${message.type}`}>
                {message.text}
              </div>
            ))
          )}
          <div>
            <input
              type="text"
              placeholder="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            <button className="newChatButton" onClick={handleNewChat}>Start New Chat</button>
          </div>
          <button className="exitButton" onClick={handleExit}>Close History</button>
          <div className="sessions">
            <h2>Chat Sessions</h2>
            {chatSessions.map((session, index) => (
              <div key={index} className="session">
                <p>{session.name}</p>
                <button onClick={() => handleLoadSession(session)}>Load</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {!showChat && (
        <div className="content">
          <h1>Welcome to the Stress Management App</h1>
          <button className="chatbotButton" onClick={handleEnterChat}>Enter Chatbot</button>
        </div>
      )}
    </div>
  );
}

export default App;
