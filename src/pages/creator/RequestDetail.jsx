import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestApi } from '../../api';
import {
  ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle2,
  XCircle, AlertCircle, FileText, Loader2, MessageSquare, Eye,
  Send, ThumbsUp, ThumbsDown, User
} from 'lucide-react';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const { data } = await requestApi.getCreatorRequestDetail(id);
      setRequest(data.data);
    } catch (err) {
      console.error('Failed to load request:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await requestApi.acceptRequest(id);
      await loadRequest();
    } catch (err) {
      console.error('Failed to accept request:', err);
      setError(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await requestApi.declineRequest(id, declineReason);
      await loadRequest();
      setShowDeclineModal(false);
    } catch (err) {
      console.error('Failed to decline request:', err);
      setError(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      viewed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Eye, label: 'Viewed' },
      negotiating: { bg: 'bg-purple-100', text: 'text-purple-700', icon: MessageSquare, label: 'Negotiating' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
      contract_pending: { bg: 'bg-orange-100', text: 'text-orange-700', icon: FileText, label: 'Contract Pending' },
      contract_signed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Contract Signed' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Loader2, label: 'In Progress' },
      content_submitted: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FileText, label: 'Content Submitted' },
      revision_requested: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle, label: 'Revision Requested' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
      declined: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Declined' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Cancelled' },
    };
    return statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText, label: status };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Loading request details...</p>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/creator/requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Requests
        </button>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Request</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(request?.status);
  const StatusIcon = statusInfo.icon;
  const canRespond = ['pending', 'viewed'].includes(request?.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/creator/requests')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Requests
      </button>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Brand Logo */}
                <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                  {request?.brand?.logo ? (
                    <img src={request.brand.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-white/60" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {request?.title || 'Collaboration Request'}
                  </h1>
                  <p className="text-gray-400">{request?.brand?.companyName || 'Unknown Brand'}</p>
                  {request?.referenceNumber && (
                    <p className="text-gray-500 text-sm mt-1">Ref: {request.referenceNumber}</p>
                  )}
                </div>
              </div>
              <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="p-8 space-y-6">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Budget</span>
              </div>
              <p className="text-xl font-bold text-blue-600">
                ₦{(request?.proposedBudget || request?.finalBudget || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {request?.proposedStartDate ? new Date(request.proposedStartDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">End Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {request?.proposedEndDate ? new Date(request.proposedEndDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Received</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(request?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Campaign Brief */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Campaign Brief</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {request?.description || 'No campaign brief provided.'}
            </p>
          </div>

          {/* Content Requirements */}
          {request?.contentRequirements && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Content Requirements</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {request.contentRequirements}
              </p>
            </div>
          )}

          {/* Target Platforms */}
          {request?.targetPlatforms && request.targetPlatforms.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Target Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {request.targetPlatforms.map((platform, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {request?.deliverables && request.deliverables.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requested Deliverables</h3>
              <div className="flex flex-wrap gap-2">
                {request.deliverables.map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                    {typeof item === 'string' ? item : item.name || item.id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brand Info */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">About the Brand</h3>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                {request?.brand?.logo ? (
                  <img src={request.brand.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{request?.brand?.companyName || 'Unknown Brand'}</h4>
                <p className="text-sm text-gray-500 capitalize">{request?.brand?.tier || 'Standard'} Brand</p>
                {request?.brand?.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.brand.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canRespond && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Respond to Request</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ThumbsUp className="w-5 h-5" />
              )}
              Accept Request
            </button>
            <button
              onClick={() => setShowDeclineModal(true)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <ThumbsDown className="w-5 h-5" />
              Decline
            </button>
            <Link
              to={`/creator/messages?request=${id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Message Brand
            </Link>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {request?.status === 'accepted' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900">Request Accepted</h3>
              <p className="text-green-700 mt-1">
                You've accepted this collaboration request. The brand will be notified and a contract will be generated for signing.
              </p>
            </div>
          </div>
        </div>
      )}

      {request?.status === 'declined' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Request Declined</h3>
              <p className="text-red-700 mt-1">
                You've declined this collaboration request.
                {request.declineReason && (
                  <span className="block mt-2">Reason: {request.declineReason}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeclineModal(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Decline Request</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to decline this request? You can optionally provide a reason.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Decline Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;
