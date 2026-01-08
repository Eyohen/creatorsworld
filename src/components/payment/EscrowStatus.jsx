import { Shield, Clock, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

const EscrowStatus = ({ escrow, userType = 'brand' }) => {
  if (!escrow || !escrow.hasPayment) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Payment Pending',
          description: 'Waiting for payment to be completed'
        };
      case 'escrow':
        return {
          icon: Shield,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Funds in Escrow',
          description: userType === 'brand'
            ? 'Funds are safely held until you approve the content'
            : 'Funds are being held securely until the brand approves your work'
        };
      case 'released':
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Payment Released',
          description: userType === 'brand'
            ? 'Payment has been released to the creator'
            : 'Payment has been added to your available balance'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Payment Failed',
          description: 'There was an issue with the payment'
        };
      default:
        return {
          icon: Wallet,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown Status',
          description: ''
        };
    }
  };

  const config = getStatusConfig(escrow.status);
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-5`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color} font-medium`}>
              {escrow.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{config.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(escrow.amount)}</p>
            </div>
            {userType === 'creator' && (
              <div>
                <p className="text-xs text-gray-500 mb-1">You will receive</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(escrow.creatorPayout)}</p>
              </div>
            )}
            {userType === 'brand' && escrow.platformFee > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Platform Fee (10%)</p>
                <p className="text-lg font-bold text-gray-600">{formatCurrency(escrow.platformFee)}</p>
              </div>
            )}
          </div>

          {escrow.escrowAt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Escrow started: {formatDate(escrow.escrowAt)}</span>
              </div>
            </div>
          )}

          {escrow.escrowReleasedAt && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Released: {formatDate(escrow.escrowReleasedAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscrowStatus;
