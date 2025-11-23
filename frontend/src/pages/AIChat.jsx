import { useState } from 'react';
import { queryAgent } from '../services/api';
import { Send, Bot, User } from 'lucide-react';

export default function AIChat({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.firstName || 'User'}! I'm your AI assistant powered by IBM watsonx Orchestrate. I can help you with:\n\n• Patient vital signs retrieval\n• Searching for patients\n• Generating shift handoff reports\n• Checking critical alerts\n\nWhat can I help you with today?`
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
      const { agent, intent, data } = response.data;

      let assistantMessage = '';

      if (data) {
        if (data.vitals) {
          const { patient, vitals, cached } = data;
          assistantMessage = `**${patient.name}** - ${patient.department}, Room ${patient.room}\n\n` +
            `📊 **Latest Vitals:**\n` +
            `• Blood Pressure: ${vitals.bloodPressure}\n` +
            `• Heart Rate: ${vitals.heartRate}\n` +
            `• Temperature: ${vitals.temperature}\n` +
            `• O2 Saturation: ${vitals.oxygenSaturation}\n` +
            `• Blood Glucose: ${vitals.bloodGlucose}\n\n` +
            `${cached ? '⚡ Retrieved from cache (50ms)' : '💾 Cached for quick access'}`;
        } else if (data.patients) {
          assistantMessage = `Found **${data.count}** patients:\n\n`;
          data.patients.slice(0, 5).forEach(p => {
            assistantMessage += `• **${p.name}** - Room ${p.room}, ${p.department}\n`;
            if (p.conditions && p.conditions.length > 0) {
              assistantMessage += `  Conditions: ${p.conditions.join(', ')}\n`;
            }
          });
          if (data.count > 5) {
            assistantMessage += `\n... and ${data.count - 5} more`;
          }
          assistantMessage += `\n\n${data.cached ? '⚡ Retrieved from cache' : ''}`;
        } else if (data.alerts) {
          assistantMessage = `**${data.count}** alerts:\n\n`;
          data.alerts.slice(0, 5).forEach(a => {
            const emoji = a.severity === 'critical' ? '🚨' :
              a.severity === 'high' ? '⚠️' : 'ℹ️';
            assistantMessage += `${emoji} **${a.title}**\n`;
            assistantMessage += `   ${a.patient} - Room ${a.room}\n`;
            assistantMessage += `   ${a.message}\n\n`;
          });
        } else if (data.shiftSummary) {
          assistantMessage = `**Shift Handoff Report**\n\n`;
          assistantMessage += `${data.shiftSummary}\n\n`;
          assistantMessage += `**Summary:**\n`;
          assistantMessage += `• Total Patients: ${data.patientCount}\n`;
          assistantMessage += `• Vitals Checked: ${data.patients.reduce((sum, p) => sum + p.vitalsChecked, 0)}\n`;
          assistantMessage += `• Medications Given: ${data.patients.reduce((sum, p) => sum + p.medicationsGiven, 0)}\n`;
        } else if (data.message) {
          assistantMessage = data.message;
          if (data.suggestions && data.suggestions.length > 0) {
            assistantMessage += '\n\nTry asking:\n';
            data.suggestions.forEach(s => {
              assistantMessage += `• ${s}\n`;
            });
          }
        }
      } else if (intent && intent.intent === 'unknown') {
        assistantMessage = "I'm not sure how to help with that. Try asking about:\n" +
          "• Patient vitals (e.g., 'Show me John Doe's vitals')\n" +
          "• Patient search (e.g., 'Find diabetic patients in ICU')\n" +
          "• Critical alerts\n" +
          "• Shift handoff reports";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        agent,
        intent: intent?.intent,
        confidence: intent?.confidence
      }]);
    } catch (error) {
      console.error('Error querying agent:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };


  const quickActions = [
    "Show me patient John Doe's vitals",
    "Find diabetic patients in ICU",
    "Show critical alerts",
    "Generate shift handoff report"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Bot className="w-8 h-8 mr-3 text-primary-500" />
          AI Assistant
        </h1>
        <p className="text-gray-400 mt-1">
          Powered by IBM watsonx Orchestrate with Redis caching
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary-600' : 'bg-purple-600'
              }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-3xl ${message.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-100'
                } rounded-lg px-4 py-3 whitespace-pre-wrap`}>
                {message.content}
              </div>
              {message.agent && (
                <div className="text-xs text-gray-500 mt-1">
                  Agent: {message.agent} | Confidence: {(message.confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-700 rounded-lg px-4 py-3">
              <div className="text-gray-400">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setInput(action)}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="mt-4 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything about patients, vitals, alerts..."
          className="flex-1 input-field"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
