import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Onboarding Management',
      description: 'View and manage all employee onboardings',
      icon: '📋',
      action: () => navigate('/onboarding'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'AI Chat Assistant',
      description: 'Ask questions about onboarding process',
      icon: '🤖',
      action: () => navigate('/chat'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor onboarding completion status',
      icon: '📊',
      action: () => navigate('/onboarding'),
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-xl text-gray-600">
            Smart HR Onboarding Assistant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={feature.action}
              className="card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total Onboardings</span>
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Completed</span>
                <span className="text-2xl font-bold text-green-600">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">In Progress</span>
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New hire added</p>
                  <p className="text-xs text-gray-500">Jane Smith - Data Scientist</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📧</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Welcome email sent</p>
                  <p className="text-xs text-gray-500">Sarah Chen</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Tasks created</p>
                  <p className="text-xs text-gray-500">6 tasks for Michael Johnson</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
