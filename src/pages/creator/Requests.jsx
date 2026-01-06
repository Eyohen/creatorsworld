import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api';
import {
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Building2, Calendar, DollarSign, ChevronRight, Loader2,
  Filter, Inbox, Eye, MessageSquare, Timer, AlertTriangle
} from 'lucide-react';

// Countdown Timer Component
const CountdownTimer = ({ expiresAt }) => {
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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <AlertTriangle className="w-4 h-4" />
        Expired
      </div>
    );
  }

  // Determine urgency color
  const totalHours = timeLeft.hours + (timeLeft.minutes / 60);
  const isUrgent = totalHours < 6; // Less than 6 hours
  const isCritical = totalHours < 2; // Less than 2 hours

  const bgColor = isCritical ? 'bg-red-100' : isUrgent ? 'bg-orange-100' : 'bg-amber-50';
  const textColor = isCritical ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-amber-700';
  const iconColor = isCritical ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-amber-500';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 ${bgColor} ${textColor} rounded-full text-sm font-medium`}>
      <Timer className={`w-4 h-4 ${iconColor} ${isCritical ? 'animate-pulse' : ''}`} />
      <span className="font-mono">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-xs opacity-75">left</span>
    </div>
  );
};

const statusOptions = [
  { value: '', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
];

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await requestApi.getCreatorRequests(params);
      setRequests(data.data.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Collaboration Requests</h1>
              <p className="text-gray-400">Manage incoming requests from brands</p>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-medium">{pendingCount} pending request{pendingCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 text-xl mb-2">
            {statusFilter ? 'No requests with this status' : 'No requests yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {!statusFilter && 'Complete your profile to start receiving collaboration requests from brands'}
          </p>
          <Link
            to="/creator/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Complete Profile
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusBadge(request.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Link
                key={request.id}
                to={`/creator/requests/${request.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  {/* Brand Logo */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {request.brand?.logo ? (
                      <img src={request.brand.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {request.title || 'Collaboration Request'}
                        </h3>
                        <p className="text-sm text-gray-500">{request.brand?.companyName}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Countdown Timer for pending/viewed requests */}
                        {['pending', 'viewed'].includes(request.status) && request.expiresAt && (
                          <CountdownTimer expiresAt={request.expiresAt} />
                        )}
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {request.description || 'No description provided'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-blue-600">
                          ₦{(request.proposedBudget || request.finalBudget || 0).toLocaleString()}
                        </span>
                      </div>
                      {(request.proposedStartDate || request.proposedEndDate) && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {request.proposedStartDate && new Date(request.proposedStartDate).toLocaleDateString()}
                            {request.proposedStartDate && request.proposedEndDate && ' - '}
                            {request.proposedEndDate && new Date(request.proposedEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-2" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;
