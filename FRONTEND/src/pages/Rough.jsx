import { useState } from 'react';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';

// Sample appointment data
const sampleAppointments = [
  {
    bookingId: "A001",
    service: { name: "Haircut and Styling" },
    artist: { name: "John Smith" },
    date: "2025-02-01",
    timeSlot: "10:00 AM",
    status: "Confirmed",
    price: 1500
  },
  {
    bookingId: "A002",
    service: { name: "Manicure Deluxe" },
    artist: { name: "Sarah Johnson" },
    date: "2025-02-02",
    timeSlot: "2:00 PM",
    status: "Pending",
    price: 800
  },
  {
    bookingId: "A003",
    service: { name: "Hair Color Treatment" },
    artist: { name: "John Smith" },
    date: "2025-02-03",
    timeSlot: "11:00 AM",
    status: "Confirmed",
    price: 2500
  },
  {
    bookingId: "A004",
    service: { name: "Facial Treatment" },
    artist: { name: "Maria Garcia" },
    date: "2025-02-04",
    timeSlot: "3:00 PM",
    status: "Pending",
    price: 1200
  }
];

const SearchDemo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState(sampleAppointments);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const debouncedSearch = debounce((query, dateRange) => {
    let filtered = [...sampleAppointments];

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Search Appointments Demo</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search appointments (try: 'john hair' or 'maria facial')"
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
                    <p>{appointment.date}</p>
                    <p className="text-sm text-gray-500">{appointment.timeSlot}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    appointment.status === "Confirmed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="py-4 px-4">Ksh {appointment.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Try these search examples:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>"john" - finds all appointments with John Smith</li>
          <li>"hair" - finds Haircut and Hair Color appointments</li>
          <li>"john hair" - finds John's hair-related appointments</li>
          <li>"A001" - finds appointment by booking ID</li>
          <li>"maria facial" - finds Maria's facial treatment appointment</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchDemo;