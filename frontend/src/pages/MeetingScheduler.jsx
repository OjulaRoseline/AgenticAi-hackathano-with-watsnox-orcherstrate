import { useState } from 'react';
import { queryAgent } from '../services/api';
import { Calendar, Clock, Users, MapPin, Send, Bot } from 'lucide-react';

export default function MeetingScheduler({ user }) {
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    attendees: '',
    location: '',
    agenda: ''
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const handleInputChange = (field, value) => {
    setMeetingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAISuggestion = async () => {
    setLoading(true);
    try {
      const response = await queryAgent(`Schedule a board meeting for critical patient cases. Suggest optimal time and agenda items.`);
      const { data } = response.data;
      
      if (data?.suggestedTime || data?.message) {
        const suggestion = {
          suggestedDate: data?.suggestedDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          suggestedTime: data?.suggestedTime || '14:00',
          criticalCases: data?.criticalCases || [
            { patient: 'Sarah Smith', room: '102', alertCount: 1, issue: 'Elevated BP' },
            { patient: 'John Doe', room: '101', alertCount: 1, issue: 'Medication due' }
          ],
          recommendedAgenda: [
            'Review critical patient alerts',
            'Discuss medication schedules',
            'Plan discharge procedures',
            'Staff coordination updates'
          ]
        };
        setAiSuggestion(suggestion);
        
        // Auto-fill form with AI suggestions
        setMeetingDetails(prev => ({
          ...prev,
          title: 'Critical Patient Review Board Meeting',
          date: suggestion.suggestedDate,
          time: suggestion.suggestedTime,
          location: 'Conference Room A',
          attendees: `${user.firstName} ${user.lastName}, Dr. Martinez, Nurse Manager`,
          agenda: suggestion.recommendedAgenda.join('\n• ')
        }));
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleMeeting = async () => {
    setLoading(true);
    try {
      // Simulate scheduling API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setScheduled(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setScheduled(false);
        setMeetingDetails({
          title: '',
          date: '',
          time: '',
          duration: '60',
          attendees: '',
          location: '',
          agenda: ''
        });
        setAiSuggestion(null);
      }, 3000);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (scheduled) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Meeting Scheduled Successfully!</h2>
          <p className="text-gray-400">All attendees have been notified</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-primary-500" />
          Meeting Scheduler
        </h1>
        <p className="text-gray-400 mt-1">
          AI-powered meeting coordination for hospital board meetings
        </p>
      </div>

      {/* AI Suggestion Button */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">AI Meeting Assistant</h2>
          <button
            onClick={getAISuggestion}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Bot className="w-5 h-5" />
            <span>{loading ? 'Analyzing...' : 'Get AI Suggestions'}</span>
          </button>
        </div>
        
        {aiSuggestion && (
          <div className="bg-gray-900 rounded-lg p-4 border border-purple-500">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">AI Recommendations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400">Suggested Date & Time</p>
                <p className="text-white font-medium">{aiSuggestion.suggestedDate} at {aiSuggestion.suggestedTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Critical Cases to Discuss</p>
                <p className="text-white font-medium">{aiSuggestion.criticalCases.length} urgent cases</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Critical Cases:</p>
              {aiSuggestion.criticalCases.map((case_, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2 mb-2">
                  <span className="text-white">{case_.patient} (Room {case_.room})</span>
                  <span className="text-red-400 text-sm">{case_.issue}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Recommended Agenda:</p>
              <ul className="text-white text-sm space-y-1">
                {aiSuggestion.recommendedAgenda.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Form */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Schedule New Meeting</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                value={meetingDetails.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Weekly Board Meeting"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={meetingDetails.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={meetingDetails.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <select
                value={meetingDetails.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="input-field"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={meetingDetails.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Conference Room A"
                className="input-field"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Attendees
              </label>
              <textarea
                value={meetingDetails.attendees}
                onChange={(e) => handleInputChange('attendees', e.target.value)}
                placeholder="Enter attendee names or emails, separated by commas"
                rows="3"
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agenda
              </label>
              <textarea
                value={meetingDetails.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                placeholder="Enter meeting agenda items..."
                rows="6"
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={scheduleMeeting}
            disabled={loading || !meetingDetails.title || !meetingDetails.date || !meetingDetails.time}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span>{loading ? 'Scheduling...' : 'Schedule Meeting'}</span>
          </button>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Meetings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
            <div>
              <h3 className="text-white font-medium">Critical Patient Review</h3>
              <p className="text-gray-400 text-sm">Yesterday, 2:00 PM - Conference Room A</p>
            </div>
            <span className="badge-low">Completed</span>
          </div>
          <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
            <div>
              <h3 className="text-white font-medium">Weekly Staff Coordination</h3>
              <p className="text-gray-400 text-sm">Nov 8, 10:00 AM - Conference Room B</p>
            </div>
            <span className="badge-low">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
