import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { messageApi } from '../../api';
import OnlineStatus from './OnlineStatus';

const StartConversation = ({ onStartConversation, currentUserType }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await messageApi.getContacts();
      setContacts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (contact) => {
    try {
      setStarting(contact.id);

      // Create or get conversation
      const payload = currentUserType === 'creator'
        ? { brandId: contact.id, creatorId: null } // creatorId will be filled by backend
        : { creatorId: contact.id, brandId: null }; // brandId will be filled by backend

      // The backend needs both IDs, so we need to pass them correctly
      // For creator: brandId is contact.id, creatorId comes from the logged-in user
      // For brand: creatorId is contact.id, brandId comes from the logged-in user

      const { data } = await messageApi.createOrGetConversation(
        currentUserType === 'creator' ? contact.id : undefined,
        currentUserType === 'brand' ? contact.id : undefined,
        contact.activeRequests?.[0]?.id // Use first active request
      );

      if (data.data?.id) {
        onStartConversation(data.data.id);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setStarting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4" />
        <p>Loading contacts...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <UserGroupIcon className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">No active collaborations</p>
        <p className="text-sm text-center text-gray-400">
          {currentUserType === 'creator'
            ? 'Accept collaboration requests from brands to start messaging them.'
            : 'Send collaboration requests to creators to start messaging them.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Start a conversation</h3>
        <p className="text-sm text-gray-500 mt-1">
          {currentUserType === 'creator'
            ? 'Message brands you are collaborating with'
            : 'Message creators you are working with'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium text-lg">
                      {contact.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {contact.userId && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineStatus userId={contact.userId} size="sm" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {contact.type === 'brand' ? contact.industry : contact.category}
                  {contact.tier && ` • ${contact.tier}`}
                </p>
                {contact.activeRequests?.length > 0 && (
                  <p className="text-xs text-green-600 truncate mt-0.5">
                    {contact.activeRequests.length} active collaboration{contact.activeRequests.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Message button */}
              <button
                onClick={() => handleStartConversation(contact)}
                disabled={starting === contact.id}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {starting === contact.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">Message</span>
              </button>
            </div>

            {/* Active requests preview */}
            {contact.activeRequests?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {contact.activeRequests.slice(0, 2).map((request) => (
                  <span
                    key={request.id}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {request.title?.substring(0, 30) || 'Collaboration'}
                    {request.title?.length > 30 && '...'}
                  </span>
                ))}
                {contact.activeRequests.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{contact.activeRequests.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartConversation;
