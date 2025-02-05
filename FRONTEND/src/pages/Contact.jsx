import { useState, useEffect, useContext } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { debounce } from 'lodash';
import { AppointmentContext } from '../context/salonContext';
import axios from 'axios';

const SearchDemo = () => {
  const {token: contextToken, setToken: setContextToken} = useContext(AppointmentContext)
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!contextToken) return;
      try {
        const response = await axios.get("http://localhost:5000/api/appointment/my-appointments", {
          headers: {
            Authorization: `Bearer ${contextToken}`, // Ensure this is the correct token
          },
        });
        setAppointments(response.data.data);
        setLoading(false)
      } catch (err) {
        console.error(
          "Error fetching appointments:",
          err.response?.data?.error || err.message
        );
        setLoading(false)
      }
    };

    if (contextToken) {
      fetchAppointments();
    }
  }, [contextToken]);

  const debouncedSearch = debounce((query, dateRange) => {
    let filtered = [...appointments];

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
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

    setFilteredAppointments(filtered);
  }, 300);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    debouncedSearch(newQuery, dateRange);
  };

  const handleSearch = () => {
    debouncedSearch(searchQuery, dateRange);
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleDeleteAppointment = async (appointmentId) => {
    console.log("Deleting appointment with ID:", appointmentId);
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`/api/appointment/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${contextToken}`,
        },
      });

      if (response.status === 200) {
        setAppointments((prev) =>
          prev.filter((app) => app._id !== appointmentId)
        );
        alert("Appointment deleted successfully");
      }
    } catch (error) {
      console.error(
        "Error deleting appointment:",
        error.response?.data?.message || error.message
      );
      alert("Failed to delete appointment");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold mb-4">My Bookings</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search appointments"
            className="w-full pl-10 p-2 border rounded-lg"
          />
        </div>

        <div className="flex-1">
          <input
            type="date"
            className="w-full p-2 border rounded-lg"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            placeholder="Start date"
          />
        </div>

        <div className="flex-1">
          <input
            type="date"
            className="w-full p-2 border rounded-lg"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            placeholder="End date"
          />
        </div>

        <div className="flex-1">
            <button
              onClick={() => handleSearch(searchQuery)}
              className="w-24 p-2 border bg-primary text-white rounded-lg"
            >
              Apply
            </button>
          </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Booking ID</th>
              <th className="text-left py-3 px-4">Service</th>
              <th className="text-left py-3 px-4">Staff</th>
              <th className="text-left py-3 px-4">Date & Time</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Price</th>
              <th className="text-left py-3 px-4">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.bookingId} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">{appointment.bookingId}</td>
                <td className="py-4 px-4">{appointment.service.name}</td>
                <td className="py-4 px-4">{appointment.artist.name}</td>
                <td className="py-4 px-4">
                  <div>
                    <p>{new Date(appointment.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{appointment.timeSlot}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    appointment.status === "Confirmed" 
                      ? "bg-green-100 text-green-800" 
                    :appointment.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    :appointment.status === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                  }`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="py-4 px-4">Ksh {appointment.service?.price}</td>
                <td className="py-4 px-4">
                      <button
                        onClick={() => handleDeleteAppointment(appointment._id)}
                      >
                        <Trash2 className="text-red-400 hover:text-red-500 cursor-pointer" />
                      </button>
                    </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchDemo;