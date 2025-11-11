import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, MessageSquare, Users, Bell, Calendar, LogOut, Menu, X, Activity } from 'lucide-react';

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/meetings', icon: Calendar, label: 'Meetings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-white">MediFlow AI</h1>
              <p className="text-xs text-gray-400">Hospital Coordination</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400">{user?.department}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
