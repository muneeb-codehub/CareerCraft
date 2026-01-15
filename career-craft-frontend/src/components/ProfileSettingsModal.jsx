// src/components/ProfileSettingsModal.jsx
import { useState, useCallback } from 'react';
import { User, Save, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name || '', 
    currentPassword: '', 
    newPassword: '' 
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = useCallback(async () => {
    try {
      setSavingProfile(true);
      const updates = {};
      
      if (profileForm.name && profileForm.name !== user?.name) {
        updates.name = profileForm.name;
      }
      
      if (profileForm.currentPassword && profileForm.newPassword) {
        updates.currentPassword = profileForm.currentPassword;
        updates.newPassword = profileForm.newPassword;
      }
      
      if (Object.keys(updates).length > 0) {
        const response = await api.put('/user/profile', updates);
        if (response.data.success) {
          if (updates.name) {
            updateUser({ name: updates.name });
          }
          alert('Profile updated successfully!');
          onClose();
          setProfileForm({ name: user?.name || '', currentPassword: '', newPassword: '' });
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }, [profileForm, user, updateUser, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1A223B] rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-[#0D1225] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Enter your name"
            />
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 bg-[#0D1225]/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              placeholder="Email address"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-2 bg-[#0D1225] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Enter current password"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-2 bg-[#0D1225] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Enter new password"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
