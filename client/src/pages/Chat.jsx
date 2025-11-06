import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { chat as chatApi } from '../api';

function Chat({ user, token, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('EMP-2024-001');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      message: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(employeeId, input);
      const botMessage = {
        message: response.data.message,
        sender: 'bot',
        intent: response.data.intent,
        timestamp: response.data.timestamp,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        message: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What's on my schedule today?",
    "What equipment will I receive?",
    "When is my first day?",
    "Who is my manager?",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card h-[calc(100vh-200px)] flex flex-col">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">AI Chat Assistant 🤖</h2>
            <p className="text-gray-600 text-sm mt-1">
              Ask me anything about your onboarding process
            </p>
            <div className="mt-3">
              <label className="text-sm text-gray-600">Employee ID:</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="ml-2 px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="EMP-2024-001">Sarah Chen (EMP-2024-001)</option>
                <option value="EMP-2024-002">Michael Johnson (EMP-2024-002)</option>
                <option value="EMP-2025-661684">Jane Smith (EMP-2025-661684)</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">Start a conversation! Try asking:</p>
                <div className="grid grid-cols-2 gap-3">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  {msg.intent && (
                    <p className="text-xs mt-2 opacity-70">
                      Intent: {msg.intent.replace(/_/g, ' ')}
                    </p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
