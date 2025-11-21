import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import { ProfilePageSkeleton } from '../components/common/Skeleton';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const getRoleDisplay = (role) => {
    const roleMap = {
      staff: 'Staff',
      approver_level_1: 'Approver Level 1',
      approver_level_2: 'Approver Level 2',
      finance: 'Finance',
      admin: 'Admin',
    };
    return roleMap[role] || role;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    // TODO: Implement API call to update profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const getInitials = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#5B4002] to-[#8B6002] px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#5B4002] text-3xl font-bold shadow-lg">
                {getInitials(user)}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">
                  {user?.first_name || user?.username}
                  {user?.last_name && ` ${user.last_name}`}
                </h1>
                <p className="text-lg opacity-90 mt-1">@{user?.username}</p>
                <p className="text-sm opacity-75 mt-2">{getRoleDisplay(user?.role)}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#5B4002] hover:bg-[#4a3302] text-white rounded-lg font-medium transition shadow-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#5B4002] hover:bg-[#4a3302] text-white rounded-lg font-medium transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a252f] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#5B4002] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#1a252f] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {user?.first_name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a252f] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#5B4002] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#1a252f] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {user?.last_name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a252f] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#5B4002] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#1a252f] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {user?.email || 'Not set'}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1a252f] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#5B4002] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#1a252f] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {user?.phone || 'Not set'}
                  </p>
                )}
              </div>

              {/* Username (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#1a252f] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {user?.username}
                </p>
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#1a252f] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {getRoleDisplay(user?.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;