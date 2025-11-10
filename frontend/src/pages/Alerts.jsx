import { useState, useEffect } from 'react';
import { getAlerts } from '../services/api';
import { Bell, AlertTriangle, Info, Loader } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, critical, high, medium, low

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await getAlerts();
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filter);

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'badge-critical',
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low'
    };
    return badges[severity] || 'badge-medium';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return <Info className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Bell className="w-8 h-8 mr-3 text-primary-500" />
            Alerts
          </h1>
          <p className="text-gray-400 mt-1">
            {filteredAlerts.length} unread alerts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'critical', 'high', 'medium', 'low'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className={`${
                alert.severity === 'critical' ? 'text-red-500' :
                alert.severity === 'high' ? 'text-orange-500' :
                alert.severity === 'medium' ? 'text-blue-500' :
                'text-green-500'
              }`}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {alert.first_name && alert.last_name && (
                        <span>
                          Patient: {alert.first_name} {alert.last_name}
                          {alert.room_number && ` • Room ${alert.room_number}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={getSeverityBadge(alert.severity)}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-gray-300 mt-3">
                  {alert.message}
                </p>
                <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{alert.alert_type}</span>
                  <span>•</span>
                  <span>
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-800 border border-gray-700 rounded-lg">
            No alerts found
          </div>
        )}
      </div>
    </div>
  );
}
