import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { onboarding as onboardingApi } from '../api';

function OnboardingDetail({ user, token, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOnboarding();
  }, [id]);

  const fetchOnboarding = async () => {
    try {
      const response = await onboardingApi.getById(id);
      setOnboarding(response.data);
    } catch (err) {
      setError('Failed to load onboarding details');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, status) => {
    try {
      await onboardingApi.updateTask(id, taskId, { status });
      fetchOnboarding(); // Refresh data
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      training: '📚',
      technical: '💻',
      meeting: '👥',
      social: '🎉',
      administrative: '📋',
    };
    return icons[category] || '📌';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !onboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Onboarding not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/onboarding')}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to List</span>
        </button>

        <div className="card mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {onboarding.firstName} {onboarding.lastName}
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{onboarding.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>
                  <p className="font-medium text-gray-900">{onboarding.role}</p>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <p className="font-medium text-gray-900">{onboarding.department}</p>
                </div>
                <div>
                  <span className="text-gray-600">Employee ID:</span>
                  <p className="font-medium text-gray-900">{onboarding.employeeId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(onboarding.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium text-gray-900">{onboarding.location || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="ml-6 text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {onboarding.progress}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all"
                style={{ width: `${onboarding.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tasks</h2>
          
          <div className="space-y-4">
            {onboarding.tasks && onboarding.tasks.length > 0 ? (
              onboarding.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border-2 rounded-lg p-4 ${getStatusColor(task.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Category: {task.category}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskUpdate(task.id, e.target.value)}
                      className="ml-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingDetail;
