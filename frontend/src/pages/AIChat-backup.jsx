import { useState } from 'react';
import { queryAgent } from '../services/api';
import { Send, Bot, User } from 'lucide-react';

export default function AIChat({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user.firstName}! I'm your AI assistant. What can I help you with?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryAgent(userMessage.content);
      const { data } = response.data;
      
      let assistantMessage = 'I received your message!';
      
      if (data?.shiftSummary) {
        assistantMessage = `**Shift Handoff Report**\n\n${data.shiftSummary}\n\n**Summary:**\n• Total Patients: ${data.patientCount}`;
      } else if (data?.vitals) {
        const { patient, vitals } = data;
        assistantMessage = `**${patient.name}** - ${patient.department}, Room ${patient.room}\n\n📊 **Latest Vitals:**\n• Blood Pressure: ${vitals.bloodPressure}`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Bot className="w-8 h-8 mr-3 text-primary-500" />
          AI Assistant
        </h1>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary-600' : 'bg-purple-600'}`}>
              {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-3xl ${message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-100'} rounded-lg px-4 py-3 whitespace-pre-wrap`}>
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-700 rounded-lg px-4 py-3">
              Loading...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 input-field"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || loading}
          className="btn-primary disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
