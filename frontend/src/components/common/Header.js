import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/auth';
import Dropdown, { DropdownItem, DropdownDivider } from './Dropdown';

const Header = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

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

  const getInitials = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/requests', label: 'Purchase Requests' },
    { path: '/profile', label: 'Profile' },
  ];

  // Check if current path matches the nav link or related routes
  const isActive = (path) => {
    if (path === '/requests') {
      // Match /requests, /create-request, and /request/:id
      return location.pathname === '/requests' || 
             location.pathname === '/create-request' || 
             location.pathname.startsWith('/request/');
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-[#1a252f] shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-8">
            <h1
              className="text-2xl sm:text-3xl font-black italic tracking-tight bg-gradient-to-r from-[#5B4002] via-[#8B6002] to-[#5B4002] bg-clip-text text-transparent drop-shadow-sm cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Georgia, serif' }}
              onClick={() => navigate('/dashboard')}
            >
              PtoP
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`relative pb-1 text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-white rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Section - Dark Mode & Profile */}
          <div className="flex items-center gap-4">
            {/* Welcome Text - Desktop Only */}
            <span className="hidden lg:block text-gray-600 dark:text-gray-300 text-sm">
              Welcome, <span className="font-medium text-gray-900 dark:text-white">{user?.first_name || user?.username}</span>
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown */}
            <Dropdown
              trigger={
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B4002] to-[#8B6002] flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700">
                  {getInitials(user)}
                </div>
              }
              align="right"
            >
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Signed in as <span className="font-medium text-gray-700 dark:text-gray-300">{user?.username}</span>
                </p>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden border-b border-gray-200 dark:border-gray-700">
                {navLinks.map((link) => (
                  <DropdownItem
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={isActive(link.path) ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}
                  >
                    {link.label}
                  </DropdownItem>
                ))}
              </div>

              {/* Actions */}
              <DropdownItem
                onClick={() => navigate('/profile')}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              >
                Profile
              </DropdownItem>

              <DropdownDivider />

              <DropdownItem
                onClick={handleLogout}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                }
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Logout
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Mobile back button */}
        {showBackButton && (
          <button
            onClick={() => navigate('/dashboard')}
            className="md:hidden flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium mt-3 transition"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;