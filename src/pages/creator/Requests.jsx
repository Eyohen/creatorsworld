import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api';

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
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-blue-100 text-blue-800',
      negotiating: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      contract_pending: 'bg-orange-100 text-orange-800',
      contract_signed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      content_submitted: 'bg-purple-100 text-purple-800',
      revision_requested: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-3xl text-gray-900">Collaboration Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {statusFilter ? 'No requests with this status' : 'No requests yet'}
          </h3>
          <p className="text-gray-500">
            {!statusFilter && 'Complete your profile to start receiving collaboration requests from brands'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/creator/requests/${request.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {request.brand?.logoUrl ? (
                        <img src={request.brand.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-gray-500 font-medium">{request.brand?.companyName?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-500">{request.brand?.companyName}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {request.deadline && (
                          <span>Due: {new Date(request.deadline).toLocaleDateString()}</span>
                        )}
                        <span>{request.items?.length || 0} deliverables</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-green-600 text-lg">
                      ₦{request.totalAmount?.toLocaleString()}
                    </p>
                    <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status?.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
