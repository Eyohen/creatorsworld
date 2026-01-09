import { useSocket } from '../../context/SocketContext';

const OnlineStatus = ({ userId, showText = false, size = 'sm' }) => {
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(userId);

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizeClasses[size]} rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {showText && (
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
