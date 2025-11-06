import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { onboarding as onboardingApi } from '../api';

function OnboardingList({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const fetchOnboardings = async () => {
    try {
      const response = await onboardingApi.getAll();
      setOnboardings(response.data.onboardings);
    } catch (err) {
      setError('Failed to load onboardings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Management</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {onboardings.map((onb) => (
            <div
              key={onb.id}
              onClick={() => navigate(`/onboarding/${onb.id}`)}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {onb.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(onb.status)}`}>
                      {onb.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Role:</span> {onb.role}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {onb.department}
                    </div>
                    <div>
                      <span className="font-medium">Employee ID:</span> {onb.employeeId}
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>{' '}
                      {new Date(onb.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {onb.progress}%
                  </div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${onb.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {onboardings.length === 0 && !loading && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No onboardings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingList;
