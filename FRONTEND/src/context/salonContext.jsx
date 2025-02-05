import { createContext, useState, useEffect } from "react";

export const AppointmentContext = createContext(
  null
  // categoriesWithServices: [],
  // fetchServicesUnderCategories: async () => {},
);

// eslint-disable-next-line react/prop-types
export const AppointmentProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [currentStep, setCurrentStep] = useState(0);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null)

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [categoryServices, setCategoryServices] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categoriesWithServices] = useState([]);

  const [appointments, setAppointments] = useState(() => {
    const savedAppointments = localStorage.getItem("appointments");
    return savedAppointments ? JSON.parse(savedAppointments) : [];
  });

  useEffect(() => {
    if (token) {
      setUser({ name: "Jane Doe" });
    }
  }, [token]);

  const [formData, setFormData] = useState({
    artist: null,
    category: null,
    service: null,
    date: null,
    time: null,
    userDetails: { firstname: "", lastname: "", email: "", phone: "" },
    paymentMethod: "cash",
  });

  const fetchCategories = async () => {
    try {
      const categoryResponse = await fetch(`${API_URL}/api/categories`);
      if (!categoryResponse.ok) {
        throw new Error("Failed to fetch categories");
      }
      const categoryData = await categoryResponse.json();
      setCategories(categoryData);
    } catch (error) {
      setError("Error fetching categories: " + error.message);
    }
  };

  const fetchServices = async () => {
    try {
      const serviceResponse = await fetch(`${API_URL}/api/services`);
      if (!serviceResponse.ok) {
        throw new Error(`HTTP error! status: ${serviceResponse.status}`);
      }
      const serviceData = await serviceResponse.json();
      setServices(serviceData);
      return serviceData;
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Error fetching services: " + error.message);
      return [];
    }
  };

  const fetchServicesByCategory = async (category) => {
    try {
      // Check for valid category
      if (!category) {
        console.error("Invalid category:", category);
        setError("Invalid category ID");
        return [];
      }

      // If services are already loaded, filter locally first
      if (services.length > 0) {
        const filteredServices =
          category === "all"
            ? services
            : services.filter((service) => service.category === category);

        // Only update state if we found matching services
        if (filteredServices.length > 0) {
          setCategoryServices(filteredServices);
          return filteredServices;
        }
      }

      // If no local services match, fetch from API
      const response = await fetch(
        `${API_URL}/api/categories/category/${category}`
      );

      // Check for network errors or non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Full error response:", errorText);
        throw new Error(
          `Failed to fetch services for category ${category}. Status: ${response.status}`
        );
      }

      const allServices = await response.json();

      // Ensure the response contains an array of services
      if (!Array.isArray(allServices)) {
        console.error(
          "Expected an array of services, but received:",
          allServices
        );
        setError("Invalid data received from the server.");
        return [];
      }

      // Update services state if necessary (optional)
      setServices(allServices);

      // Filter services by category
      const filteredServices =
        category === "all"
          ? allServices
          : allServices.filter((service) => service.category === category);

      // Update category services state
      setCategoryServices(filteredServices);

      return filteredServices;
    } catch (error) {
      console.error("Error fetching category services:", error);
      setError(`Unable to load services: ${error.message}`);
      return [];
    }
  };

  const fetchArtists = async () => {
    try {
      const artistResponse = await fetch(`${API_URL}/api/artist`);
      if (!artistResponse.ok) {
        throw new Error("Failed to fetch artists");
      }
      const artistData = await artistResponse.json();
      setArtists(artistData);
    } catch (error) {
      setError("Error fetching artists: " + error.message);
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

        // Update state
        setCategories(categoryData);
        setServices(serviceData);
        setArtists(artistData);
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

  const resetBooking = () => {
    setCurrentStep(0);
    setIsBooked(false);
    setBookingId(null);
    setError(null);
    setIsSubmitting(false);
    setFormData({
      artist: null,
      category: null,
      service: null,
      date: null,
      time: null,
      userDetails: { firstname: "", lastname: "", email: "", phone: "" },
      paymentMethod: "cash",
    });
    setCategoryServices([]);
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
    user,
    setUser
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export default AppointmentProvider;
