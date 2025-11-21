import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import { RequestDetailSkeleton } from '../components/common/Skeleton';
import StatusBadge from '../components/requests/StatusBadge';
import Modal from '../components/requests/Modal';

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
    if (!['approver_level_1', 'approver_level_2'].includes(userRole)) return false;
    const level = userRole === 'approver_level_1' ? 1 : 2;
    const hasApproved = request.approvals.some((approval) => approval.level === level);
    return !hasApproved;
  };

  const openApprovalModal = (action) => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setComments('');
  };

  if (loading) {
    return <RequestDetailSkeleton />;
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request not found</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-[#5B4002] hover:text-[#4a3302] dark:text-[#c9a227] dark:hover:text-[#d4af37] font-medium">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <Header showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Request Title</label>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{request.title}</h2>
                </div>
                <StatusBadge status={request.status} />
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-200 leading-relaxed">{request.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Amount</dt>
                  <dd className="text-lg font-bold text-gray-900 dark:text-white">${request.amount?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created Date</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-200">
                    {new Date(request.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created By</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-200 font-medium">{request.created_by?.username}</dd>
                </div>
                {request.vendor_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vendor</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-200 font-medium">{request.vendor_name}</dd>
                  </div>
                )}
              </dl>

              {/* Documents */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attached Documents</h4>
                <div className="space-y-2">
                  {request.proforma && (
                    <a href={request.proforma} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-[#5B4002] dark:text-[#c9a227] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition font-medium">
                      <span>📄</span><span>View Proforma Invoice</span>
                    </a>
                  )}
                  {request.purchase_order && (
                    <a href={request.purchase_order} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-[#5B4002] dark:text-[#c9a227] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition font-medium">
                      <span>📋</span><span>Download Purchase Order</span>
                    </a>
                  )}
                  {request.receipt && (
                    <a href={request.receipt} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-[#5B4002] dark:text-[#c9a227] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition font-medium">
                      <span>🧾</span><span>View Receipt</span>
                    </a>
                  )}
                  {!request.proforma && !request.purchase_order && !request.receipt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic px-4 py-2">No documents attached</p>
                  )}
                </div>
              </div>
            </div>

            {/* Approval History */}
            <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Approval History</h3>
              {request.approvals?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No approvals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {request.approvals?.map((approval) => (
                    <div key={approval.id} className="border-l-4 border-[#5B4002] dark:border-[#c9a227] pl-4 py-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{approval.approver?.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Approver Level {approval.level}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(approval.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full self-start ${
                          approval.action === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {approval.action}
                        </span>
                      </div>
                      {approval.comments && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{approval.comments}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {canApprove() && (
              <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions Required</h3>
                <div className="space-y-3">
                  <button onClick={() => openApprovalModal('approve')} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-sm">
                    ✓ Approve Request
                  </button>
                  <button onClick={() => openApprovalModal('reject')} className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-sm">
                    ✗ Reject Request
                  </button>
                </div>
              </div>
            )}

            {user?.role === 'staff' && request.created_by?.id === user.user_id && request.status === 'approved' && !request.receipt && (
              <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Receipt</h3>
                <form onSubmit={handleReceiptUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select receipt file</label>
                    <input type="file" onChange={(e) => setReceiptFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5B4002] file:text-white hover:file:bg-[#4a3302] file:cursor-pointer" />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PDF, JPG, JPEG, or PNG (Max 10MB)</p>
                  </div>
                  <button type="submit" disabled={actionLoading || !receiptFile}
                    className="w-full px-4 py-3 bg-[#5B4002] text-white rounded-lg font-semibold hover:bg-[#4a3302] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
                    {actionLoading ? 'Uploading...' : 'Submit Receipt'}
                  </button>
                </form>
              </div>
            )}

            {request.receipt_validated !== null && (
              <div className="bg-white dark:bg-[#1e2936] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receipt Validation</h3>
                <div className={`p-4 rounded-lg border-2 ${request.receipt_validated ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{request.receipt_validated ? '✓' : '⚠'}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${request.receipt_validated ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                        {request.receipt_validated ? 'Receipt Validated Successfully' : 'Validation Issues Found'}
                      </p>
                      {request.validation_errors?.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {request.validation_errors.map((error, i) => (
                            <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span><span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal isOpen={showApprovalModal} onClose={closeApprovalModal} title={approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
        onConfirm={approvalAction === 'approve' ? handleApprove : handleReject} confirmText={`Confirm ${approvalAction === 'approve' ? 'Approval' : 'Rejection'}`}
        confirmLoading={actionLoading} confirmClassName={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {approvalAction === 'reject' ? 'Comments (Required)' : 'Comments (Optional)'}
        </label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4}
          placeholder={approvalAction === 'reject' ? 'Please provide a reason for rejection...' : 'Add any comments or notes...'}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a252f] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4002] focus:border-transparent resize-none" />
      </Modal>
    </div>
  );
};

export default RequestDetail;