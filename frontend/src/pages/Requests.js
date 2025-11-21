import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import { Skeleton } from '../components/common/Skeleton';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await requestsAPI.getAll(params);
      setRequests(response.data.results || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    }
    setLoading(false);
  };

  const filteredRequests = requests.filter((request) =>
    request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.created_by?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  };

  const stats = getStats();

  // Stats Skeleton
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-50 dark:bg-[#1e2936] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );

  // Table Skeleton
  const TableSkeleton = () => (
    <div className="bg-gray-50 dark:bg-[#1e2936] rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-[#1a2530]">
            <tr>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i}>
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 bg-white dark:bg-transparent">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2 mb-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all procurement requests</p>
          </div>

          {user?.role === 'staff' && (
            <button
              onClick={() => navigate('/create-request')}
              className="px-4 py-2 bg-[#5B4002] hover:bg-[#4a3302] text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </button>
          )}
        </div>

        {/* Stats Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-[#1e2936] p-4 rounded-lg border border-blue-200 dark:border-blue-500/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-[#2a2a1e] p-4 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</p>
            </div>
            <div className="bg-green-50 dark:bg-[#1a2e2a] p-4 rounded-lg border border-green-200 dark:border-green-500/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.approved}</p>
            </div>
            <div className="bg-red-50 dark:bg-[#2a1e21] p-4 rounded-lg border border-red-200 dark:border-red-500/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gray-50 dark:bg-[#1e2936] rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a252f] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <TableSkeleton />
        ) : filteredRequests.length === 0 ? (
          <div className="bg-gray-50 dark:bg-[#1e2936] rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No requests found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Create a new request to get started'}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-[#1e2936] rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-[#1a2530]">
                  <tr>
                    {['Title', 'Amount', 'Status', 'Created By', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-[#364A5E]/30 transition">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${request.amount?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            request.status === 'approved' ? 'bg-green-500' :
                            request.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{request.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{request.created_by?.username || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/request/${request.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#364A5E]/30 bg-white dark:bg-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p>Amount: <span className="font-semibold text-gray-900 dark:text-white">${request.amount?.toLocaleString() || '0'}</span></p>
                    <p>Created by: {request.created_by?.username || 'N/A'}</p>
                    <p>Date: {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/request/${request.id}`)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Requests;