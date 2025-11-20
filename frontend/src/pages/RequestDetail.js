import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await requestsAPI.getById(id);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching request:', error);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await requestsAPI.approve(id, comments);
      setShowApprovalModal(false);
      setComments('');
      fetchRequest();
    } catch (error) {
      alert('Error approving request: ' + (error.response?.data?.detail || 'Unknown error'));
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      alert('Comments are required when rejecting a request');
      return;
    }
    setActionLoading(true);
    try {
      await requestsAPI.reject(id, comments);
      setShowApprovalModal(false);
      setComments('');
      fetchRequest();
    } catch (error) {
      alert('Error rejecting request: ' + (error.response?.data?.detail || 'Unknown error'));
    }
    setActionLoading(false);
  };

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      alert('Please select a receipt file');
      return;
    }
    setActionLoading(true);
    try {
      await requestsAPI.submitReceipt(id, receiptFile);
      setReceiptFile(null);
      fetchRequest();
      alert('Receipt uploaded successfully!');
    } catch (error) {
      alert('Error uploading receipt: ' + (error.response?.data?.detail || 'Unknown error'));
    }
    setActionLoading(false);
  };

  const canApprove = () => {
    if (!request || request.status !== 'pending') return false;
    const userRole = user?.role;
    
    // Check if user is an approver
    if (!['approver_level_1', 'approver_level_2'].includes(userRole)) return false;
    
    // Check if this level has already approved
    const level = userRole === 'approver_level_1' ? 1 : 2;
    const hasApproved = request.approvals.some(
      (approval) => approval.level === level
    );
    
    return !hasApproved;
  };

  const openApprovalModal = (action) => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Request not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">${request.amount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.created_by.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(request.created_at).toLocaleString()}
                  </dd>
                </div>
                {request.vendor_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.vendor_name}</dd>
                  </div>
                )}
              </dl>

              {/* Documents */}
              <div className="mt-6 space-y-2">
                {request.proforma && (
                  <a
                    href={request.proforma}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    📄 View Proforma Invoice
                  </a>
                )}
                {request.purchase_order && (
                  <div>
                    <a
                      href={request.purchase_order}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      📋 Download Purchase Order
                    </a>
                  </div>
                )}
                {request.receipt && (
                  <div>
                    <a
                      href={request.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      🧾 View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Approval History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h2>
              {request.approvals.length === 0 ? (
                <p className="text-gray-500 text-sm">No approvals yet</p>
              ) : (
                <div className="space-y-4">
                  {request.approvals.map((approval) => (
                    <div key={approval.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {approval.approver.username} - Level {approval.level}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(approval.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            approval.action === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {approval.action}
                        </span>
                      </div>
                      {approval.comments && (
                        <p className="mt-2 text-sm text-gray-700">{approval.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Approval Actions */}
            {canApprove() && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => openApprovalModal('approve')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => openApprovalModal('reject')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            )}

            {/* Receipt Upload */}
            {user?.role === 'staff' &&
              request.created_by.id === user.user_id &&
              request.status === 'approved' &&
              !request.receipt && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h3>
                  <form onSubmit={handleReceiptUpload} className="space-y-4">
                    <input
                      type="file"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || !receiptFile}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Uploading...' : 'Submit Receipt'}
                    </button>
                  </form>
                </div>
              )}

            {/* Receipt Validation */}
            {request.receipt_validated !== null && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Validation</h3>
                <div
                  className={`p-4 rounded-md ${
                    request.receipt_validated
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      request.receipt_validated ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {request.receipt_validated ? '✓ Receipt Validated' : '⚠ Validation Issues'}
                  </p>
                  {request.validation_errors?.length > 0 && (
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {request.validation_errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                approvalAction === 'reject'
                  ? 'Comments required for rejection...'
                  : 'Optional comments...'
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setComments('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={approvalAction === 'approve' ? handleApprove : handleReject}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-md text-white ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;