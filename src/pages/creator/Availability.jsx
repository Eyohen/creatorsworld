import { useState, useEffect } from 'react';
import { creatorApi } from '../../api';
import {
  Calendar, Plus, Trash2, Clock, AlertCircle, CheckCircle2,
  Loader2, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const Availability = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState({
    isAvailable: true,
    leadTimeDays: 3,
    slots: []
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    slotType: 'blocked'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const { data } = await creatorApi.getMyAvailability();
      setAvailability(data.data);
    } catch (err) {
      console.error('Failed to load availability:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setSaving(true);
    setError('');
    try {
      await creatorApi.updateAvailability({
        isAvailable: availability.isAvailable,
        leadTimeDays: availability.leadTimeDays
      });
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.startDate || !newSlot.endDate) {
      setError('Please select start and end dates');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data } = await creatorApi.addAvailabilitySlot({
        startDate: newSlot.startDate,
        endDate: newSlot.endDate,
        reason: newSlot.reason,
        slotType: newSlot.slotType,
        isAvailable: false
      });
      setAvailability(prev => ({
        ...prev,
        slots: [...prev.slots, data.data]
      }));
      setShowAddModal(false);
      setNewSlot({ startDate: '', endDate: '', reason: '', slotType: 'blocked' });
      setSuccess('Blocked dates added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add blocked dates');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this blocked period?')) return;

    try {
      await creatorApi.deleteAvailabilitySlot(slotId);
      setAvailability(prev => ({
        ...prev,
        slots: prev.slots.filter(s => s.id !== slotId)
      }));
      setSuccess('Blocked period deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete blocked period');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const isDateBlocked = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.slots.some(slot => {
      return dateStr >= slot.startDate && dateStr <= slot.endDate && !slot.isAvailable;
    });
  };

  const getSlotForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.slots.find(slot => {
      return dateStr >= slot.startDate && dateStr <= slot.endDate;
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isBlocked = isDateBlocked(date);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const slot = getSlotForDate(date);

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium relative
            ${isPast ? 'text-gray-300' : 'text-gray-700'}
            ${isToday ? 'ring-2 ring-blue-500' : ''}
            ${isBlocked && !isPast ? 'bg-red-100 text-red-700' : ''}
            ${slot?.slotType === 'booked' && !isPast ? 'bg-orange-100 text-orange-700' : ''}
          `}
          title={slot?.reason || (isBlocked ? 'Blocked' : '')}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Loading availability...</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">Availability Calendar</h1>
              <p className="text-gray-400">Manage your schedule and block dates when you're unavailable</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Block Dates
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 text-green-600">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Availability Settings
          </h2>

          <div className="space-y-4">
            {/* Available Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Open for Work</p>
                <p className="text-sm text-gray-500">Accept new collaboration requests</p>
              </div>
              <button
                onClick={() => setAvailability(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  availability.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow ${
                  availability.isAvailable ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Lead Time */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-medium text-gray-900 mb-2">Lead Time (days)</label>
              <p className="text-sm text-gray-500 mb-3">Minimum notice required before a campaign can start</p>
              <select
                value={availability.leadTimeDays}
                onChange={(e) => setAvailability(prev => ({ ...prev, leadTimeDays: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days (1 week)</option>
                <option value={14}>14 days (2 weeks)</option>
              </select>
            </div>

            <button
              onClick={handleUpdateSettings}
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded" />
              <span className="text-sm text-gray-600">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 rounded" />
              <span className="text-sm text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded" />
              <span className="text-sm text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Periods List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Blocked Periods</h2>

        {availability.slots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No blocked dates. Your calendar is fully open!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availability.slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    slot.slotType === 'booked' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(slot.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(slot.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {slot.reason || slot.slotType}
                    </p>
                  </div>
                </div>
                {slot.slotType !== 'booked' && (
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Blocked Dates Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Block Dates</h3>
            <p className="text-gray-600 mb-6">
              Block dates when you're not available for collaborations.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newSlot.startDate}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newSlot.endDate}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newSlot.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                <input
                  type="text"
                  value={newSlot.reason}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Vacation, Personal time"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                disabled={saving || !newSlot.startDate || !newSlot.endDate}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Adding...' : 'Block Dates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
