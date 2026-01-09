import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { requestApi, paymentApi, messageApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { PaystackPayment, EscrowStatus } from '../../components/payment';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const { data } = await requestApi.getBrandRequestDetail(id);
      setRequest(data.data);

      // Load escrow status
      const escrowRes = await paymentApi.getEscrowStatus(id);
      setEscrow(escrowRes.data.data);
    } catch (err) {
      console.error('Failed to load request:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference, verifyData) => {
    console.log('Payment success callback:', reference, verifyData);
    try {
      setActionLoading(true);
      // Payment already verified in PaystackPayment component
      // Just reload request and escrow data
      await loadRequest();
    } catch (err) {
      console.error('Failed to reload after payment:', err);
      setError('Payment successful but failed to update. Please refresh the page.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveContent = async () => {
    if (!confirm('Are you sure you want to approve this content? This will release the payment to the creator.')) {
      return;
    }

    try {
      setActionLoading(true);
      await requestApi.approveContent(id);
      await loadRequest();
    } catch (err) {
      console.error('Failed to approve content:', err);
      setError('Failed to approve content');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (revisionNotes.trim().length < 10) {
      setError('Please provide detailed revision notes (at least 10 characters)');
      return;
    }

    try {
      setActionLoading(true);
      await requestApi.requestRevision(id, revisionNotes);
      setShowRevisionModal(false);
      setRevisionNotes('');
      await loadRequest();
    } catch (err) {
      console.error('Failed to request revision:', err);
      setError(err.response?.data?.message || 'Failed to request revision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      setActionLoading(true);
      await requestApi.cancelRequest(id);
      navigate('/brand/requests');
    } catch (err) {
      console.error('Failed to cancel request:', err);
      setError(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteCollaboration = async () => {
    if (!confirm('Mark this collaboration as complete?')) {
      return;
    }

    try {
      setActionLoading(true);
      await requestApi.completeCollaboration(id);
      await loadRequest();
    } catch (err) {
      console.error('Failed to complete:', err);
      setError('Failed to complete collaboration');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageCreator = async () => {
    if (!request?.creator?.id || !request?.brand?.id) {
      setError('Unable to start conversation. Missing profile information.');
      return;
    }

    try {
      setMessageLoading(true);
      // Create or get existing conversation
      const { data } = await messageApi.createOrGetConversation(
        request.brand.id,
        request.creator.id,
        id // requestId
      );

      // Navigate to the conversation
      navigate(`/brand/messages/${data.data.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation with creator');
    } finally {
      setMessageLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-blue-100 text-blue-800',
      negotiating: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      contract_signed: 'bg-green-100 text-green-800',
      payment_pending: 'bg-orange-100 text-orange-800',
      in_progress: 'bg-blue-100 text-blue-800',
      content_submitted: 'bg-purple-100 text-purple-800',
      content_approved: 'bg-green-100 text-green-800',
      revision_requested: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Request not found</h2>
        <Link to="/brand/requests" className="text-green-600 hover:underline mt-2 inline-block">
          Back to requests
        </Link>
      </div>
    );
  }

  const canPay = request.status === 'accepted' || request.status === 'contract_signed';
  const canApproveContent = request.status === 'content_submitted';
  const canRequestRevision = request.status === 'content_submitted' && request.revisionCount < (request.maxRevisions || 2);
  const canComplete = request.status === 'content_approved';
  const canCancel = ['pending', 'viewed', 'negotiating'].includes(request.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/brand/requests')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-gray-500">Ref: {request.referenceNumber}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}>
          {request.status?.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Creator Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Creator</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {request.creator?.profileImage ? (
                    <img src={request.creator.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {request.creator?.displayName || `${request.creator?.firstName} ${request.creator?.lastName}`}
                  </h3>
                  <p className="text-sm text-gray-500">{request.creator?.tier} Creator</p>
                </div>
              </div>
              <button
                onClick={handleMessageCreator}
                disabled={messageLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {messageLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Message
              </button>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Request Details</h2>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-700">{request.description}</p>
              </div>

              {request.contentRequirements && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Requirements</h4>
                  <p className="text-gray-700">{request.contentRequirements}</p>
                </div>
              )}

              {request.targetPlatforms?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {request.targetPlatforms.map((platform) => (
                      <span key={platform} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submitted Content */}
          {request.submittedContentUrls && request.submittedContentUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Submitted Content</h2>
              <div className="space-y-3">
                {request.submittedContentUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="flex-1 text-gray-700 truncate">{url}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>

              {/* Content Review Actions */}
              {canApproveContent && (
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleApproveContent}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Approve & Release Payment
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    disabled={actionLoading || !canRequestRevision}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Request Revision ({request.revisionCount || 0}/{request.maxRevisions || 2})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Escrow Status */}
          {escrow && escrow.hasPayment && (
            <EscrowStatus escrow={escrow} userType="brand" />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget & Timeline */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Budget & Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(request.proposedBudget || request.finalBudget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(request.proposedStartDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(request.proposedEndDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action */}
          {canPay && (!escrow || !escrow.hasPayment) && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
              <p className="text-sm text-gray-600 mb-4">
                The creator has accepted your request. Pay now to start the collaboration.
              </p>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(request.proposedBudget)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Platform Fee (10%)</span>
                  <span className="font-medium">{formatCurrency((request.proposedBudget || 0) * 0.1)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-green-600">{formatCurrency(request.proposedBudget)}</span>
                </div>
              </div>
              <PaystackPayment
                amount={request.proposedBudget || request.finalBudget}
                email={user?.email}
                requestId={id}
                onSuccess={handlePaymentSuccess}
                disabled={actionLoading}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-3 text-center">
                Funds will be held in escrow until you approve the content
              </p>
            </div>
          )}

          {/* Complete Action */}
          {canComplete && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Complete Collaboration</h2>
              <p className="text-sm text-gray-600 mb-4">
                Content has been approved and payment released. Mark this collaboration as complete.
              </p>
              <button
                onClick={handleCompleteCollaboration}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                Mark as Complete
              </button>
            </div>
          )}

          {/* Cancel Action */}
          {canCancel && (
            <div className="bg-white rounded-xl shadow p-6">
              <button
                onClick={handleCancelRequest}
                disabled={actionLoading}
                className="w-full border border-red-300 text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Cancel Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Revision</h2>
            <p className="text-gray-600 mb-4">
              Provide detailed feedback on what changes you need the creator to make.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe the changes you need..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Revisions remaining: {(request.maxRevisions || 2) - (request.revisionCount || 0)}
            </p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionNotes('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={actionLoading || revisionNotes.trim().length < 10}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;
