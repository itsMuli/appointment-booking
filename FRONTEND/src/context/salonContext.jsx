import { createContext, useState, useEffect } from "react";
import axios from 'axios';

export const AppointmentContext = createContext(
  null
  // categoriesWithServices: [],
  // fetchServicesUnderCategories: async () => {},
);

// eslint-disable-next-line react/prop-types
export const AppointmentProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [currentStep, setCurrentStep] = useState(0);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null)

  // When token changes, fetch the real user profile and keep it in context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/user/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // backend returns { success: true, user: { ... } }
        setUser(res.data.user || null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err.response?.data || err.message);
        // If token invalid/expired, clear it
        if (err.response?.status === 401) {
          try { localStorage.removeItem('token'); } catch (removeErr) { console.error('Failed to remove token from localStorage', removeErr); }
          setToken(null);
        }
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [token, API_URL]);

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [categoryServices, setCategoryServices] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categoriesWithServices] = useState([]);

  const [appointments, setAppointments] = useState(() => {
    const savedAppointments = localStorage.getItem("appointments");
    return savedAppointments ? JSON.parse(savedAppointments) : [];
  });

  const [formData, setFormData] = useState({
    artist: null,
    category: null,
    service: null,
    date: null,
    time: null,
    userDetails: { firstname: "", lastname: "", email: "", phone: "" },
    paymentMethod: "cash",
  });

  const fetchArtists = async () => {
    try {
      const response = await fetch(`${API_URL}/api/artist`);
      const data = await response.json();
      if (data.success && data.artists) {
        setArtists(data.artists);
      } else if (Array.isArray(data)) {
        // Backward compatibility: handle direct array response
        setArtists(data);
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      } else if (Array.isArray(data)) {
        // Backward compatibility: handle direct array response
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      const data = await response.json();
      if (data.success && data.services) {
        setServices(data.services);
      } else if (Array.isArray(data)) {
        // Backward compatibility: handle direct array response
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchServicesByCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/api/services/category/${categoryId}`);
      const data = await response.json();
      if (data.success && data.services) {
        setCategoryServices(data.services);
      } else if (Array.isArray(data)) {
        // Backward compatibility: handle direct array response
        setCategoryServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all data concurrently
        const [categoriesRes, servicesRes, artistsRes] = await Promise.all([
          fetch(`${API_URL}/api/categories`),
          fetch(`${API_URL}/api/services`),
          fetch(`${API_URL}/api/artist`),
        ]);

        // Check if any request failed
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        if (!servicesRes.ok) throw new Error("Failed to fetch services");
        if (!artistsRes.ok) throw new Error("Failed to fetch artists");

        // Parse all responses
        const [categoryData, serviceData, artistData] = await Promise.all([
          categoriesRes.json(),
          servicesRes.json(),
          artistsRes.json(),
        ]);

        // Update state - extract the data arrays from the API response
        // Handle both formats: { success: true, data: [...] } or direct array (backward compatibility)
        if (categoryData.success && categoryData.categories) {
          setCategories(categoryData.categories);
        } else if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        }
        
        if (serviceData.success && serviceData.services) {
          setServices(serviceData.services);
        } else if (Array.isArray(serviceData)) {
          setServices(serviceData);
        }
        
        if (artistData.success && artistData.artists) {
          setArtists(artistData.artists);
          if (artistData.artists.length >= 1) {
            setFormData((prev) =>
              prev.artist ? prev : { ...prev, artist: artistData.artists[0] }
            );
          }
        } else if (Array.isArray(artistData)) {
          setArtists(artistData);
          if (artistData.length >= 1) {
            setFormData((prev) =>
              prev.artist ? prev : { ...prev, artist: artistData[0] }
            );
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(`Failed to load initial data: ${error.message}`);
      }
    };

    fetchInitialData();
  }, [API_URL]);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addAppointment = () => {
    const newAppointment = {
      id: Math.floor(Math.random() * 10000),
      category: formData.category?.name,
      service: formData.service.name,
      date: formData.date.toLocaleDateString(),
      time: formData.time,
      duration: formData.service.duration,
      status: "Pending",
      staff: formData.artist.name,
      payment: formData.service.price,
      paymentMethod: formData.paymentMethod,
      customerDetails: formData.userDetails,
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment.id;
  };

  const resetFormData = () => {
    setFormData({
      artist: artists[0] || null,
      category: null,
      service: null,
      date: null,
      time: null,
      userDetails: { firstname: "", lastname: "", email: "", phone: "" },
      paymentMethod: "cash",
    });
    setCategoryServices([]);
  };

  const resetBooking = () => {
    setCurrentStep(0);
    setIsBooked(false);
    setBookingId(null);
    setError(null);
    setIsSubmitting(false);
    resetFormData();
  };

  const handleBookAppointment = async () => {
    setIsSubmitting(true);
    try {
      const newBookingId = addAppointment();
      setBookingId(newBookingId);
      setIsBooked(true);
      resetBooking();
    } catch (error) {
      setError("Failed to book appointment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = {
    token,
    setToken,
    user,
    currentStep,
    setCurrentStep,
    isBooked,
    setIsBooked,
    bookingId,
    setBookingId,
    error,
    setError,
    isSubmitting,
    setIsSubmitting,
    formData,
    updateFormData,
    resetFormData,
    resetBooking,
    handleBookAppointment,
    appointments,
    setAppointments,
    addAppointment,
    services,
    setServices,
    fetchServices,
    fetchArtists,
    fetchCategories,
    categoryServices,
    setCategoryServices,
    fetchServicesByCategory,
    categories,
    setCategories,
    artists,
    setArtists,
    categoriesWithServices,
    setUser
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export default AppointmentProvider;
