import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { appointmentAPI } from '../../services/adminApi';

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'bg-green-100 text-green-700';
  if (s === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-800';
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!q) return true;
      const name = `${a.userDetails?.firstname || ''} ${a.userDetails?.lastname || ''}`.toLowerCase();
      const email = (a.userDetails?.email || '').toLowerCase();
      const service = (a.service?.name || '').toLowerCase();
      const bookingId = (a.bookingId || '').toLowerCase();
      return name.includes(q) || email.includes(q) || service.includes(q) || bookingId.includes(q);
    });
  }, [appointments, filter, search]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      toast.success(`Marked ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await appointmentAPI.delete(id);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Appointment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="prata-regular text-2xl text-gray-900">Appointments</h2>
        <p className="text-sm text-gray-500 mt-1">Confirm, cancel, or remove bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, service, booking ID…"
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Artist</th>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No appointments match.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a._id} className="border-t border-stone-100 align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {a.userDetails?.firstname} {a.userDetails?.lastname}
                        </div>
                        <div className="text-xs text-gray-500">{a.userDetails?.email}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{a.bookingId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{a.service?.name || '—'}</div>
                        <div className="text-xs text-gray-500">${a.service?.price ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3">{a.artist?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {a.date ? new Date(a.date).toLocaleDateString() : '—'}
                        <div className="text-xs">{a.timeSlot}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {a.status !== 'Confirmed' && (
                            <button
                              type="button"
                              onClick={() => updateStatus(a._id, 'Confirmed')}
                              className="px-2 py-1 text-xs rounded-md bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              Confirm
                            </button>
                          )}
                          {a.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => updateStatus(a._id, 'Cancelled')}
                              className="px-2 py-1 text-xs rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(a._id)}
                            className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
