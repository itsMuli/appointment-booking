import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RefreshCw, CalendarDays, Users, Sparkles, DollarSign } from 'lucide-react';
import { appointmentAPI, userAPI, artistAPI } from '../../services/adminApi';

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'bg-green-100 text-green-700';
  if (s === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-800';
};

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    total: 0,
    users: 0,
    artists: 0,
    revenue: 0,
  });
  const [recent, setRecent] = useState([]);

  const load = async () => {
    setRefreshing(true);
    try {
      const [appointmentsRes, usersRes, artistsRes] = await Promise.allSettled([
        appointmentAPI.getAll(),
        userAPI.getAll(),
        artistAPI.getAll(),
      ]);

      let appointments = [];
      if (appointmentsRes.status === 'fulfilled') {
        appointments = appointmentsRes.value.data.appointments || [];
      } else {
        toast.error('Could not load appointments');
      }

      const todayStr = new Date().toDateString();
      const confirmed = appointments.filter((a) => a.status === 'Confirmed');
      setStats({
        today: appointments.filter((a) => new Date(a.date).toDateString() === todayStr).length,
        pending: appointments.filter((a) => a.status === 'Pending').length,
        confirmed: confirmed.length,
        cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
        total: appointments.length,
        users:
          usersRes.status === 'fulfilled'
            ? (usersRes.value.data.users || []).length
            : 0,
        artists:
          artistsRes.status === 'fulfilled'
            ? (artistsRes.value.data.artists || []).length
            : 0,
        revenue: confirmed.reduce((sum, a) => sum + (a.service?.price || 0), 0),
      });

      setRecent(
        [...appointments]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8)
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Today's bookings", value: stats.today, icon: CalendarDays, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Customers', value: stats.users, icon: Users, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Artists', value: stats.artists, icon: Sparkles, tone: 'bg-orange-50 text-orange-700' },
    { label: 'Confirmed revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="prata-regular text-2xl text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Salon activity at a glance</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Confirmed</p>
          <p className="text-2xl font-semibold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Cancelled</p>
          <p className="text-2xl font-semibold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <h3 className="font-medium text-gray-900">Recent appointments</h3>
          <Link to="/admin/appointments" className="text-sm text-primary hover:underline">
            Manage all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-gray-500 text-sm">No appointments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a._id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      {a.userDetails?.firstname} {a.userDetails?.lastname}
                    </td>
                    <td className="px-4 py-3">{a.service?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.date ? new Date(a.date).toLocaleDateString() : '—'}
                      {a.timeSlot ? ` · ${a.timeSlot}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
