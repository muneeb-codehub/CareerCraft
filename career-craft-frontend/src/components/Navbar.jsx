// src/components/Navbar.jsx
import { useState, memo, useCallback } from 'react';
import { ChevronDown, User, LogOut, Briefcase } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ProfileSettingsModal from './ProfileSettingsModal';

const Navbar = memo(({ onToggleSidebar, isSidebarCollapsed }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  const { user, logout } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    setShowProfileDropdown(false);
  }, [logout]);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  const openProfileSettings = useCallback(() => {
    setShowProfileSettings(true);
    setShowProfileDropdown(false);
  }, []);

  const tickerText = "Welcome to our Career Crafting Platform • Empowering your professional journey • AI-powered resume building • Smart interview preparation • Personalized career roadmaps • Track your progress seamlessly • Build your dream career today •";

  return (
    <nav className="bg-[#1D224C] border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
      {/* Main navbar content */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 overflow-hidden">
        {/* Left Side - Logo & Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:pl-2">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors touch-manipulation"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="block">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CareerCraft</h1>
              <p className="text-xs text-gray-400 hidden md:block">Professional Growth Platform</p>
            </div>
          </div>
        </div>

        {/* Center - Ticker Text */}
        <div className="flex-1 overflow-hidden mx-4 hidden lg:block">
          <div className="ticker-wrapper">
            <div className="ticker-content">
              <span className="ticker-text">{tickerText}</span>
              <span className="ticker-text">{tickerText}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Profile Dropdown */}
          <div className="relative z-50">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-1 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors touch-manipulation"
              aria-label="Profile menu"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="fixed inset-0 z-[9999]" onClick={() => setShowProfileDropdown(false)}>
                <div 
                  className="absolute right-4 top-16 w-64 bg-[#1A223B] rounded-xl shadow-2xl border border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User Info Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button 
                      onClick={openProfileSettings}
                      className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700/50 flex items-center space-x-3 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile Settings</span>
                    </button>
                  </div>
                  
                  {/* Logout */}
                  <div className="py-2 border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/20 flex items-center space-x-3 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;