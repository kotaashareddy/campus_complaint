import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Send } from 'lucide-react';

const ChatWindow = ({ complaintId, onClose }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/messages/${complaintId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [complaintId]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const messageData = {
      complaintId,
      name: user?.name || 'User',
      message: input,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await axios.post("http://localhost:8000/messages", messageData);
      setMessages((prev) => [...prev, res.data]);
      setInput('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div style={styles.chatOverlay}>
      <div style={styles.chatBox}>
        {/* Chat Header */}
        <div style={styles.chatHeader}>
          <h3 style={styles.chatTitle}>Campus Discussion</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Chat Body */}
        <div style={styles.chatBody}>
          {messages.length > 0 ? (
            messages.map((msg, idx) => {
              const isMe = msg.name === user?.name;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isMe ? 'var(--maroon)' : '#ffffff',
                      color: isMe ? '#ffffff' : 'var(--ink)',
                      border: isMe ? 'none' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      maxWidth: '80%',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '2px', fontWeight: 600 }}>
                      {msg.name}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--ink-muted)', marginTop: '40px', fontSize: '0.9rem' }}>
              No messages yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div style={styles.chatInputRow}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            style={styles.chatInput}
          />
          <button style={styles.sendBtn} onClick={handleSend}>
            <Send size={16} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  chatOverlay: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    width: '360px',
    maxWidth: '90vw'
  },
  chatBox: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '460px'
  },
  chatHeader: {
    backgroundColor: 'var(--maroon)',
    color: '#ffffff',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatTitle: {
    margin: 0,
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: 700
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  chatBody: {
    backgroundColor: 'var(--paper)',
    padding: '14px',
    flex: 1,
    overflowY: 'auto'
  },
  chatInputRow: {
    display: 'flex',
    borderTop: '1px solid var(--border-color)',
    padding: '8px',
    backgroundColor: '#ffffff'
  },
  chatInput: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '0.9rem',
    marginRight: '8px'
  },
  sendBtn: {
    backgroundColor: 'var(--maroon)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};

export default ChatWindow;
