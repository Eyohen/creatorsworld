import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestApi } from '../../api';
import {
  ArrowLeft, Building2, Calendar, DollarSign, Clock, CheckCircle2,
  XCircle, AlertCircle, FileText, Loader2, MessageSquare, Eye,
  Send, ThumbsUp, ThumbsDown, User, Timer, AlertTriangle
} from 'lucide-react';

// Countdown Timer Component
const CountdownTimer = ({ expiresAt, large = false }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  const calculateTimeLeft = useCallback(() => {
    if (!expiresAt) return null;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const difference = expiry - now;

    if (difference <= 0) {
      return { expired: true };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  }, [expiresAt]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-2 ${large ? 'p-4 rounded-2xl' : 'px-3 py-1.5 rounded-full'} bg-red-100 text-red-700 font-medium`}>
        <AlertTriangle className={large ? 'w-6 h-6' : 'w-4 h-4'} />
        <span className={large ? 'text-lg' : 'text-sm'}>Request Expired</span>
      </div>
    );
  }

  // Determine urgency color
  const totalHours = timeLeft.hours + (timeLeft.minutes / 60);
  const isUrgent = totalHours < 6;
  const isCritical = totalHours < 2;

  const bgColor = isCritical ? 'bg-red-100' : isUrgent ? 'bg-orange-100' : 'bg-amber-50';
  const textColor = isCritical ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-amber-700';
  const borderColor = isCritical ? 'border-red-200' : isUrgent ? 'border-orange-200' : 'border-amber-200';

  if (large) {
    return (
      <div className={`${bgColor} ${textColor} border ${borderColor} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-3">
          <Timer className={`w-6 h-6 ${isCritical ? 'animate-pulse' : ''}`} />
          <span className="font-semibold text-lg">Time to Respond</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-sm opacity-75">Hours</div>
          </div>
          <div className="text-3xl font-bold">:</div>
          <div className="text-center">
            <div className="text-4xl font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-sm opacity-75">Minutes</div>
          </div>
          <div className="text-3xl font-bold">:</div>
          <div className="text-center">
            <div className="text-4xl font-bold font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-sm opacity-75">Seconds</div>
          </div>
        </div>
        <p className="mt-4 text-sm opacity-75">
          Please accept or decline this request before the timer expires.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 ${bgColor} ${textColor} rounded-full text-sm font-medium`}>
      <Timer className={`w-4 h-4 ${isCritical ? 'animate-pulse' : ''}`} />
      <span className="font-mono">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-xs opacity-75">left</span>
    </div>
  );
};

// Decline reason categories
const declineCategories = [
  { value: 'schedule', label: 'Schedule Conflict', description: 'I have other commitments during this period' },
  { value: 'budget', label: 'Budget Too Low', description: 'The offered budget doesn\'t meet my rates' },
  { value: 'niche', label: 'Not My Niche', description: 'This campaign doesn\'t align with my content' },
  { value: 'brand_fit', label: 'Brand Mismatch', description: 'This brand doesn\'t fit my audience' },
  { value: 'requirements', label: 'Requirements Unclear', description: 'The campaign requirements are not clear enough' },
  { value: 'other', label: 'Other Reason', description: 'Another reason not listed above' },
];

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineCategory, setDeclineCategory] = useState('');
  const [declineError, setDeclineError] = useState('');

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

  const [suspensionWarning, setSuspensionWarning] = useState(null);

  const handleDecline = async () => {
    // Validate decline reason
    if (!declineCategory) {
      setDeclineError('Please select a reason category');
      return;
    }
    if (!declineReason || declineReason.trim().length < 10) {
      setDeclineError('Please provide a detailed reason (at least 10 characters)');
      return;
    }

    setDeclineError('');
    setActionLoading(true);
    try {
      const { data } = await requestApi.declineRequest(id, { reason: declineReason.trim(), category: declineCategory });
      await loadRequest();
      setShowDeclineModal(false);
      setDeclineReason('');
      setDeclineCategory('');

      // Check if suspended or warning
      if (data.suspended) {
        setSuspensionWarning({
          type: 'suspended',
          message: data.message,
          suspendedUntil: data.suspendedUntil
        });
      } else if (data.warning) {
        setSuspensionWarning({
          type: 'warning',
          message: data.warning
        });
      }
    } catch (err) {
      console.error('Failed to decline request:', err);
      setDeclineError(err.response?.data?.message || 'Failed to decline request');
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
              <div className="flex items-center gap-3">
                {/* Countdown Timer */}
                {['pending', 'viewed'].includes(request?.status) && request?.expiresAt && (
                  <CountdownTimer expiresAt={request.expiresAt} />
                )}
                <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusInfo.label}
                </span>
              </div>
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

      {/* Countdown Timer - Large version */}
      {canRespond && request?.expiresAt && (
        <CountdownTimer expiresAt={request.expiresAt} large />
      )}

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

      {/* Suspension Warning Modal */}
      {suspensionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSuspensionWarning(null)}
          />
          <div className={`relative rounded-2xl max-w-md w-full p-6 shadow-2xl ${
            suspensionWarning.type === 'suspended' ? 'bg-red-600' : 'bg-amber-500'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                suspensionWarning.type === 'suspended' ? 'bg-white/20' : 'bg-white/30'
              }`}>
                {suspensionWarning.type === 'suspended' ? (
                  <AlertTriangle className="w-8 h-8 text-white" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {suspensionWarning.type === 'suspended' ? 'Account Suspended' : 'Warning'}
              </h3>
              <p className="text-white/90 mb-6">
                {suspensionWarning.message}
              </p>
              {suspensionWarning.type === 'suspended' && suspensionWarning.suspendedUntil && (
                <p className="text-white/80 text-sm mb-4">
                  Suspension ends: {new Date(suspensionWarning.suspendedUntil).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => setSuspensionWarning(null)}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  suspensionWarning.type === 'suspended'
                    ? 'bg-white text-red-600 hover:bg-red-50'
                    : 'bg-white text-amber-600 hover:bg-amber-50'
                } transition-colors`}
              >
                {suspensionWarning.type === 'suspended' ? 'Go to Dashboard' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowDeclineModal(false); setDeclineError(''); }}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Decline Request</h3>
            <p className="text-gray-600 mb-6">
              Please let the brand know why you're declining this request. This feedback helps them improve future campaigns.
            </p>

            {declineError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {declineError}
              </div>
            )}

            {/* Reason Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you declining? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {declineCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setDeclineCategory(cat.value)}
                    className={`p-3 text-left border rounded-xl transition-all ${
                      declineCategory === cat.value
                        ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`font-medium text-sm ${declineCategory === cat.value ? 'text-red-700' : 'text-gray-900'}`}>
                      {cat.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${declineCategory === cat.value ? 'text-red-600' : 'text-gray-500'}`}>
                      {cat.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide more details about why you're declining (minimum 10 characters)..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {declineReason.length}/10 characters minimum
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeclineModal(false); setDeclineError(''); }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Decline Request
                  </>
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
