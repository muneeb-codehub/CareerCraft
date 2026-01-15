// src/components/Sidebar.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Target,
  MessageCircle,
  BookOpen,
  User,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import ProfileSettingsModal from './ProfileSettingsModal';

const Sidebar = ({ isCollapsed, onToggle, isMobile, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // Debug: Log user object to console
  console.log('Sidebar user object:', user);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Resume Builder',
      path: '/resume',
      icon: FileText,
      badge: 'AI'
    },
    {
      name: 'Skill Gap Analysis',
      path: '/skill-gap',
      icon: Target,
      badge: null
    },
    {
      name: 'Interview Practice',
      path: '/interview',
      icon: MessageCircle,
      badge: 'New'
    },
    {
      name: 'Career Roadmap',
      path: '/roadmap',
      icon: BookOpen,
      badge: null
    },
    {
      name: 'Portfolio',
      path: '/portfolio',
      icon: User,
      badge: null
    },
    {
      name: 'Progress Tracker',
      path: '/progress',
      icon: BarChart3,
      badge: null
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const profileCompletion = 65; // This will come from your backend

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full bg-[#1D224C] border-r border-gray-700 transition-all duration-300 overflow-y-auto
          ${isMobile 
            ? `${isCollapsed ? '-translate-x-full' : 'translate-x-0'} w-64 sm:w-72`
            : `${isCollapsed ? 'w-16' : 'w-64'}`
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            {!isCollapsed && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Profile Status</h3>
                  {!isMobile && (
                    <button
                      onClick={onToggle}
                      className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Completion</span>
                    <span className="text-sm font-medium text-blue-400">100%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {isCollapsed && !isMobile && (
              <div className="flex justify-center">
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center rounded-xl transition-all duration-200 group touch-manipulation
                    ${isCollapsed && !isMobile ? 'justify-center p-3' : 'px-3 py-2.5 space-x-3'}
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                  aria-label={item.name}
                >
                  <Icon className={`flex-shrink-0 ${isCollapsed && !isMobile ? 'w-5 h-5' : 'w-5 h-5'}`} />
                  
                  {(!isCollapsed || isMobile) && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.name}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${item.badge === 'AI' ? 'bg-purple-100 text-purple-700' : ''}
                          ${item.badge === 'New' ? 'bg-green-100 text-green-700' : ''}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats - Only show when expanded */}
          {(!isCollapsed || isMobile) && (
            <div className="p-4 border-t border-gray-700">
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">This Week</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Start your tasks</span>
                    <span className="font-medium text-white">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-300">Resume Building</span>
                    <span className="font-small text-white">...</span>
                    </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-300">Skills improving</span>
                    <span className="font-medium text-white">...</span>  
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Profile - Bottom */}
          <div className="p-4 border-t border-gray-700">
            {(!isCollapsed || isMobile) ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <button 
                  onClick={() => setShowProfileSettings(true)}
                  className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />
    </>
  );
};

export default Sidebar;