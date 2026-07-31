import { useState, useEffect, useContext } from 'react';
import { Trash2, Calendar, User, KeyRound, LogOut } from 'lucide-react';
import { debounce } from 'lodash';
import { AppointmentContext } from '../context/salonContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { API_URL } from '../config';

const MyAppointments = () => {
  const {
    appointments,
    setAppointments,
    token: contextToken,
    setToken: setContextToken,
    user,
    setUser,
  } = useContext(AppointmentContext);
  // Ensure user profile is available (fallback if context hasn't populated yet)
  useEffect(() => {
    if (!user && contextToken) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/user/user`, {
            headers: { Authorization: `Bearer ${contextToken}` },
          });
          setUser(res.data.user || res.data);
        } catch (err) {
          console.error('Fallback fetch user profile error', err?.response?.data || err.message);
        }
      };
      fetchProfile();
    }
  }, [user, contextToken, API_URL, setUser]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("appointments");
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, variant: "info", title: "", message: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const navigate = useNavigate();

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
    setPendingDeleteId(null);
  };

  const showModal = (opts) => setModal({ open: true, variant: "info", title: "", message: "", ...opts });

  // Fetch appointments from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!contextToken) return;
      try {
        const response = await axios.get(`${API_URL}/api/appointment/my-appointments`, {
          headers: {
            Authorization: `Bearer ${contextToken}`,
          },
        });
        const data = response.data.data || [];
        setAppointments(data);
        setFilteredAppointments(data);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error fetching appointments:",
          err.response?.data?.error || err.message
        );
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (contextToken) {
      fetchAppointments();
    }
  }, [contextToken, API_URL, setAppointments]);

  const applyFilters = (list, query, range) => {
    let filtered = [...list];

    if (range.start && range.end) {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    }

    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter((appointment) =>
        searchTerms.every(term =>
          appointment.service?.name?.toLowerCase().includes(term) ||
          appointment.artist?.name?.toLowerCase().includes(term) ||
          appointment.bookingId?.toString().includes(term)
        )
      );
    }

    return filtered;
  };

  const debouncedSearch = debounce((query, range, list) => {
    setFilteredAppointments(applyFilters(list, query, range));
  }, 300);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    debouncedSearch(newQuery, dateRange, appointments);
  };

  const handleSearch = () => {
    setFilteredAppointments(applyFilters(appointments, searchQuery, dateRange));
  };

  const removeAppointmentLocally = (appointmentId) => {
    const id = String(appointmentId);
    setAppointments((prev) => {
      const next = prev.filter((app) => String(app._id) !== id);
      setFilteredAppointments(applyFilters(next, searchQuery, dateRange));
      return next;
    });
  };

  const requestDeleteAppointment = (appointmentId) => {
    setPendingDeleteId(appointmentId);
    showModal({
      variant: "confirm",
      title: "Delete appointment?",
      message: "Are you sure you want to delete this appointment? This cannot be undone.",
      confirmLabel: "Delete",
    });
  };

  const confirmDeleteAppointment = async () => {
    const appointmentId = pendingDeleteId;
    if (!appointmentId) return;
    setPendingDeleteId(null);
    setModal((prev) => ({ ...prev, open: false }));

    try {
      const response = await axios.delete(`${API_URL}/api/appointment/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${contextToken}`,
        },
      });

      if (response.status === 200) {
        removeAppointmentLocally(appointmentId);
        showModal({
          variant: "success",
          title: "Appointment deleted",
          message: "The appointment was removed successfully.",
          confirmLabel: "OK",
        });
      }
    } catch (error) {
      console.error(
        "Error deleting appointment:",
        error.response?.data?.message || error.message
      );
      showModal({
        variant: "error",
        title: "Delete failed",
        message: error.response?.data?.message || "Failed to delete appointment.",
        confirmLabel: "OK",
      });
    }
  };

  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {String(error)}</div>;
  }

  const handleSidebarItemClick = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setContextToken(null);
    navigate("/");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const AppointmentsView = () => {
    return (
      <div className="flex-1 lg:ml-0 min-w-0 w-full">
        <h2 className="font-medium text-lg md:text-xl mb-4 mt-1 md:mt-2">My Bookings</h2>
        <div className="flex flex-col gap-3 mb-5 md:mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search appointment"
            className="w-full p-2.5 border rounded-xl text-sm"
          />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
            <input
              type="date"
              className="w-full p-2 border rounded-xl text-sm min-w-0"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <input
              type="date"
              className="w-full p-2 border rounded-xl text-sm min-w-0"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="col-span-2 md:col-span-1 w-full p-2.5 bg-primary text-white rounded-xl text-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 mb-3">
              <img
                src="/make.png"
                alt="No appointments"
                className="w-full h-full object-contain bg-white"
              />
            </div>
            <p className="text-gray-500 font-medium text-sm">No Appointments found!</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filteredAppointments.map((appointment, index) => (
                <div
                  key={appointment._id || appointment.id || index}
                  className="border border-gray-100 rounded-2xl p-4 shadow-sm bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">#{appointment.bookingId}</p>
                      <h3 className="font-semibold text-gray-800 truncate">
                        {appointment.service?.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(appointment.date).toLocaleDateString()} · {appointment.timeSlot}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {appointment.artist?.name} · Ksh {appointment.service?.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          appointment.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => requestDeleteAppointment(appointment._id)}
                        aria-label="Delete appointment"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Booking ID</th>
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Date & Time</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Staff</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => (
                    <tr key={appointment.id || index} className="border-b">
                      <td className="py-4 px-4">#{appointment.bookingId}</td>
                      <td className="py-4 px-4">{appointment.service.name}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p>{new Date(appointment.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.timeSlot}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-sm ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">{appointment.artist?.name}</td>
                      <td className="py-4 px-4">
                        Ksh {appointment.service?.price}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => requestDeleteAppointment(appointment._id)}
                        >
                          <Trash2 className="text-red-400 hover:text-red-500 cursor-pointer" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const EditAccountView = () => {
    return (
      <div className="flex-1 p-6">
        <h2 className="font-medium text-xl mb-6">Edit Account</h2>
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input type="text" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input type="tel" className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <button
            type="submit"
            className="p-2 bg-primary text-white rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    );
  };

  const ChangePasswordView = () => {
    return (
      <div className="flex-1 p-6">
        <h2 className="font-medium text-xl mb-6">Change Password</h2>
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <input type="password" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input type="password" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input type="password" className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <button
            type="submit"
            className="p-2 bg-primary text-white rounded-lg"
          >
            Update Password
          </button>
        </form>
      </div>
    );
  };

  const LogOutView = () =>
    contextToken ? (
      <div className="text-center flex-1 p-6 mt-10">
        <div className="text-center flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">Logout</h2>
          <p>Are you sure you want to logout?</p>
          <button
            onClick={handleLogout}
            className="bg-primary text-white px-4 py-2 rounded mt-4"
            aria-label="Confirm Logout"
          >
            Confirm Logout
          </button>
        </div>
        <div className="text-center flex-1">
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-2 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : null;

  const renderView = () => {
    switch (currentView) {
      case "appointments":
        return <AppointmentsView />;
      case "edit-account":
        return <EditAccountView />;
      case "change-password":
        return <ChangePasswordView />;
      case "logout":
        return <LogOutView />;
      default:
        return <AppointmentsView />;
    }
  };

  const SidebarContent = () => (
    <ul className="space-y-4 md:space-y-8">
      <li
        onClick={() => handleSidebarItemClick("appointments")}
        className={`flex items-center gap-2 font-light cursor-pointer text-sm ${
          currentView === "appointments" ? "text-primary" : "text-gray-500"
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span>My Appointments</span>
      </li>
      <li
        onClick={() => handleSidebarItemClick("edit-account")}
        className={`flex items-center gap-2 font-light cursor-pointer text-sm ${
          currentView === "edit-account" ? "text-primary" : "text-gray-500"
        }`}
      >
        <User className="w-5 h-5" />
        <span>Edit Account</span>
      </li>
      <li
        onClick={() => handleSidebarItemClick("change-password")}
        className={`flex items-center gap-2 font-light cursor-pointer text-sm ${
          currentView === "change-password" ? "text-primary" : "text-gray-500"
        }`}
      >
        <KeyRound className="w-5 h-5" />
        <span>Change Password</span>
      </li>
      <li
        onClick={() => handleSidebarItemClick("logout")}
        className={`flex items-center gap-2 font-light cursor-pointer text-sm ${
          currentView === "logout" ? "text-primary" : "text-gray-500"
        }`}
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </li>
    </ul>
  );

  return (
    <div className="my-2 md:my-4 max-w-full overflow-x-hidden">
      <Modal
        open={modal.open}
        variant={modal.variant}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel || (modal.variant === "confirm" ? "Delete" : "OK")}
        onClose={closeModal}
        onConfirm={modal.variant === "confirm" ? confirmDeleteAppointment : closeModal}
      />
      <div className="lg:hidden flex justify-between items-center p-3 bg-white shadow-sm mb-3 border rounded-xl">
        <h1 className="text-lg font-medium">My Bookings</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
        >
          <User className="w-5 h-5" />
          <span className="text-sm truncate max-w-[100px]">{user?.name || "User"}</span>
        </button>
      </div>
      {isSidebarOpen && (
        <div className="lg:hidden relative z-20 mb-3 bg-white border rounded-xl p-4 shadow-md">
          <SidebarContent />
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full min-h-0 lg:min-h-[600px] mx-auto rounded-xl p-3 md:p-4 border overflow-hidden">
        <div className="hidden lg:block w-64 bg-white rounded-lg p-6 border-r-2 border-gray-200 shrink-0">
          <div className="flex flex-col items-center my-8">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-md font-sm">{user?.name || "User"}</h2>
            <p className="text-sm text-gray-500">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <SidebarContent />
        </div>

        {renderView()}
      </div>
    </div>
  );
};

export default MyAppointments;
