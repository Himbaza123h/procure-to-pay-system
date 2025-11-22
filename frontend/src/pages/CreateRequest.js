import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../services/api';
import Header from '../components/common/Header';
import { FormSkeleton } from '../components/common/Skeleton';
import { toast } from 'react-toastify';


const CreateRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    proforma: null,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, proforma: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestsAPI.create(formData);
      toast.success('Request created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create request');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
        <Header showBackButton />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FormSkeleton fields={4} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <Header showBackButton />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Purchase Request</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Request Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a252f] text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4002] focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g., Office Supplies Purchase"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a252f] text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4002] focus:border-transparent resize-none placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Provide detailed description of the items to be purchased..."
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a252f] text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4002] focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Proforma Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proforma Invoice (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-[#5B4002] dark:hover:border-[#8B6002] transition bg-white dark:bg-[#1a252f]">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="proforma" className="relative cursor-pointer rounded-md font-medium text-[#5B4002] dark:text-[#c9a227] hover:text-[#4a3302] dark:hover:text-[#d4af37] focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="proforma" name="proforma" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG up to 10MB</p>
                  {formData.proforma && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                      ✓ Selected: {formData.proforma.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-[#5B4002]/10 to-[#8B6002]/10 dark:from-[#5B4002]/20 dark:to-[#8B6002]/20 border border-[#5B4002]/20 dark:border-[#5B4002]/40 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-[#5B4002] dark:text-[#c9a227] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#5B4002] dark:text-[#c9a227] mb-1">
                    AI-Powered Document Processing
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    If you upload a proforma invoice, our AI will automatically extract vendor information, items, and pricing details to streamline the approval process.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a252f] hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#5B4002] hover:bg-[#4a3302] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B4002] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateRequest;