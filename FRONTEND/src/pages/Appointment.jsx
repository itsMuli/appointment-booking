import { useState, useEffect, useContext } from "react";
import {
  Users,
  ClipboardList,
  Calendar,
  FileText,
  PenBoxIcon,
  Check,
} from "lucide-react";
import Title from "../components/Title";
import { AppointmentContext } from "../context/salonContext";
import { isMonday, isPast, format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: "artist", label: "Artist", icon: Users },
  { id: "service", label: "Service", icon: ClipboardList },
  { id: "datetime", label: "Date & Time", icon: Calendar },
  { id: "details", label: "Fill out your details", icon: PenBoxIcon },
  { id: "summary", label: "Summary", icon: FileText },
];

const timeSlots = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

const paymentMethods = [
  { id: "mpesa", label: "M-pesa" },
  { id: "cash", label: "Cash" },
  { id: "card", label: "Credit Card" },
];

const Appointment = () => {
  const navigate = useNavigate()
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const {
    formData,
    updateFormData,
    artists,
    categories,
    services,
    setArtists,
    setCategories,
    setServices,
    currentStep,
    setCurrentStep,
    categoryServices,
    fetchServices,
    fetchServicesByCategory,
    resetFormData,
    addAppointment
  } = useContext(AppointmentContext);
  // eslint-disable-next-line no-unused-vars
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
   const resetLocalState = () => {
    setSelectedCategory(categories[0]?.name || "");
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setIsDateInvalid(false);
    setDisabledSlots(new Set());
    setCurrentStep(0);
  };


  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.name || ""
  );
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (categories[0] && selectedCategory !== categories[0]?.name) {
      setSelectedCategory(categories[0]?.name);
    }
  }, [categories]);

  const handleCategorySelect = async (category) => {
    if (category.name === "ALL") {
      await fetchServices();
      updateFormData("category", null);
      setSelectedCategory("ALL");
    } else {
      await fetchServicesByCategory(category._id);
      updateFormData("category", category);
      setSelectedCategory(category.name);
    }
  };
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    updateFormData("service", service);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const displayedServices = formData.category ? categoryServices : services;

  const fetchInitialData = async () => {
    try {
      const artistResponse = await fetch("/api/artist");
      const artistData = await artistResponse.json();
      setArtists(artistData);

      const categoryResponse = await fetch("/api/categories");
      const categoryData = await categoryResponse.json();
      setCategories(categoryData);

      const serviceResponse = await fetch("/api/services");
      const serviceData = await serviceResponse.json();
      setServices(serviceData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    if (formData.category) {
      fetchServicesByCategory(formData.category.id);
    }
  }, [formData.category]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return !!formData.artist;
      case 1:
        return !!formData.category && !!formData.service;
      case 2:
        return !!formData.date && !!formData.time;
      case 3:
        return Object.values(formData.userDetails).every((v) => v);
      default:
        return false;
    }
  };

  const canNavigateToStep = (stepIndex) => {
    if (stepIndex === 0) return true; // Always allow navigating to the first step

    // For other steps, require all previous steps to be fully complete
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepComplete(i)) return false;
    }

    return true;
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isDateInvalid, setIsDateInvalid] = useState(false);
  const [disabledSlots, setDisabledSlots] = useState(new Set());

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (isPast(newDate) || isMonday(newDate)) {
      setIsDateInvalid(true);
      e.target.classList.add('cursor-not-allowed'); 
    } else {
      setIsDateInvalid(false);
      e.target.classList.remove('cursor-not-allowed');
      setSelectedDate(newDate);
      updateFormData("date", newDate);
    }
  };

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (selectedDate) {
        try {
          const response = await axios.get(
            `${API_URL}/api/appointment/date/${format(selectedDate, "yyyy-MM-dd")}`
          );
          if (response.data.success) {
            setDisabledSlots(new Set(response.data.bookedSlots));
          }
        } catch (error) {
          console.error("Error fetching booked slots:", error);
        }
      }
    };
    fetchBookedSlots();
  }, [selectedDate]);

  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     try {
  //       const response = await axios.post(`${API_URL}/api/details`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData.userDetails)
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch user details");
  //       }

  //       const userDetails = await response.json();
  //       updateFormData("userDetails", userDetails);
  //     } catch (error) {
  //       console.error("Error fetching user details:", error);
  //     }
  //   };

  //   fetchUserDetails();
  // }, [API_URL, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2 className="mb-3 text-gray-600 font-semibold">
              Select Artist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.map((artistItem) => {
                const isSelected = formData.artist?.id === artistItem.id;
                return (
                  <button
                    key={`artist-${artistItem.id}`}
                    onClick={() => updateFormData("artist", artistItem)}
                    className={`
          p-3 rounded-lg transition-colors relative
          ${isSelected ? "border border-primary" : "border border-gray-200"}
        `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-800 font-medium text-center">
                      {artistItem.name}
                    </h3>
                    {artistItem.email && (
                      <p className="text-sm text-gray-500 text-center truncate">
                        {artistItem.email}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-gray-600 font-semibold mb-3">
                Category
              </h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <button
                    key={`category-${category._id || index}`}
                    onClick={() => handleCategorySelect(category)}
                    className={`font-light text-gray-600 px-4 py-1 transition-colors rounded-md border ${
                      selectedCategory === category.name
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-gray-600 font-semibold mb-3">
                Service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {displayedServices.map((service, index) => (
                  <div
                    key={`service-${service._id || index}`}
                    onClick={() => handleServiceSelect(service)}
                    className={`cursor-pointer p-4 rounded-md border ${
                      selectedService?._id === service._id
                        ? "border-primary text-white"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-gray-800">
                        {service.name}
                      </h3>
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center p-1 text-white bg-primary rounded">
                          <span>Ksh</span>
                          <span className="ml-1 ">{service.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.category && displayedServices.length === 0 && (
                <div className="text-gray-500 text-center mt-4">
                  No services available for the selected category.
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Date Picker */}
              <div className="flex-1">
                <h3 className="text-gray-600 font-semibold mb-2">Pick a Date</h3>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                  onChange={handleDateChange}
                  className={`border px-3 py-2 cursor-pointer rounded-md w-full focus:ring-primary focus:border-primary ${
                    isDateInvalid
                      ? "cursor-not-allowed bg-gray-200"
                      : "bg-white"
                  }`}
                />
                {isDateInvalid && (
                  <div>
                    <p className="text-red-500 text-sm mt-2">
                      Selected date is invalid.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDateInvalid(false);
                        const dateInput = document.querySelector('input[type="date"]');
                        if (dateInput) {
                          dateInput.classList.remove('cursor-not-allowed');
                        }
                      }}
                      className="text-blue-500 text-sm mt-2"
                    >
                      Choose another date
                    </button>
                  </div>
                )}
              </div>

              {/* Time Slot Selector */}
              <div className="flex-1">
                <h3 className="text-gray-600 font-medium mb-2">
                  Pick a Time Slot
                </h3>
                <div className="grid grid-cols gap-4">
                  {timeSlots.map((slot, index) => {
                    const isDisabled = disabledSlots.has(slot);
                    const isSelected = selectedTimeSlot === slot;

                    return (
                      <button
                        key={`time-slot-${index}`}
                        onClick={() => {
                          if (!isDisabled && !isDateInvalid) {
                            // Only allow time slot selection if date is valid
                            setSelectedTimeSlot(slot);
                            updateFormData("time", slot);
                          }
                        }}
                        className={`px-3 py-2 rounded-md border text-sm ${
                          isDisabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white"
                        }`}
                        disabled={isDisabled || isDateInvalid} // Disable time slots if the date is invalid
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedDate && selectedTimeSlot && (
              <div className="text-gray-600 mt-4">
                <strong>Selected:</strong> {format(selectedDate, "PPP")} at{" "}
                {selectedTimeSlot}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="p-4 border rounded-lg">
            <h2 className="mb-3 font-medium">Fill Your Details</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {[
                { id: "firstname", label: "FirstName", type: "text" },
                { id: "lastname", label: "LastName", type: "text" },
                { id: "email", label: "Email Address", type: "email" },
                { id: "phone", label: "Phone Number", type: "tel" },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    value={formData.userDetails[field.id] || ""}
                    onChange={(e) =>
                      updateFormData("userDetails", {
                        ...formData.userDetails,
                        [field.id]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              ))}
            </form>
          </div>
        );

      case 4:
        return (
          <div className="p-4 border rounded-lg">
            <div className="flex justify-center mb-6">
              <img src="summary.png" alt="Summary" className="h-20 w-20" />
            </div>

            <h2 className="text-center text-2xl font-light mb-2">Summary</h2>
            <p className="text-center text-gray-500 mb-6">
              Your appointment booking summary
            </p>

            {/* Customer Details */}
            <div className="text-center mb-5">
              <h3 className="font-semibold text-sm text-gray-600">Artist</h3>
              <p className="text-sm">{formData.artist.name}</p>
            </div>

            {/* Service and Date */}
            <div className="flex justify-around border-b pb-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-500">Service</h4>
                <p className="text-sm">{formData.service?.name}</p>
              </div>
              <div>
                <h4 className="font-medium  text-gray-500">Date & Time</h4>
                <p className="text-sm">
                  {formData.date?.toLocaleDateString()} {formData.time}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex justify-between mb-4">
              <p className="font-medium text-gray-500">Total</p>
              <p className="font-light text-sm ">Ksh {formData.service?.price}</p>
            </div>
            

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-500 mb-2"
              >
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) =>
                  updateFormData("paymentMethod", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Payment Method Details */}
            {formData.paymentMethod === "mpesa" && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">Send payment to:</p>
                <p className="font-medium">Till Number: 123456</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please enter the M-pesa confirmation code when you receive it
                </p>
              </div>
            )}

            {formData.paymentMethod === "card" && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">
                  You will be redirected to our secure payment gateway after
                  confirming your booking
                </p>
              </div>
            )}

            {formData.paymentMethod === "cash" && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">
                  Please pay in cash at our location during your appointment
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleBookAppointment = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }
  
    try {
      const response = await axios.post(
        `${API_URL}/api/appointment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
  
      if (response.data.success) {
        const newAppointment = {
          id: response.data.data.bookingId,
          service: formData.service.name,
          date: formData.date.toLocaleDateString(),
          duration: formData.service.duration,
          status: "Pending",
          staff: formData.artist.name,
          payment: formData.service.price,
        };
  
        // Add the new appointment to the context
        addAppointment(newAppointment);
  
        setBookingId(response.data.data.bookingId);
        setIsBooked(true);
        resetFormData();
        resetLocalState();
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      // Handle error (show error message to user)
    }
  };
  

  const BookingConfirmationContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-red-100 p-4 rounded-full">
          <div className="bg-red-400 rounded-full p-2">
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-gray-600">
          Booking ID: <span className="font-semibold">#{bookingId}</span>
        </p>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold mb-2">
          Your Appointment Booked successfully!
        </h2>
        <p className="text-gray-600">
          We have sent your booking information to your email address.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-600 mb-1">Service:</p>
            <p className="font-semibold">{formData.service?.name}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-1">Date & Time:</p>
            <p className="font-semibold">
              {formData.date?.toLocaleDateString()}
            </p>
            <p className="font-semibold">{formData.time}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-1">Artist:</p>
            <p className="font-semibold">{formData.artist.name}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isBooked) {
    return (
      <div className="my-4" id="appointment-section">
        <div className="text-center text-2xl py-8">
          <Title text1={"BOOKING"} text2={"CONFIRMED"} />
        </div>
        <div className="px-4 md:px-8 lg:px-12 xl:px-8">
          <div className="bg-white p-8 rounded-lg">
            <BookingConfirmationContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4" id="appointment-section">
      <div className="text-center text-2xl py-8">
        <Title text1={"BOOK"} text2={"APPONTMENT"} />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 lg:px-8 xl:px-12 min-h-[400px] bg-stone-100 rounded-lg">
      <nav className="w-full lg:w-1/5 mb-4">
        <div className="bg-white shadow-md rounded mt-6">
          <ul className="flex lg:block gap-2 overflow-x-auto lg:overflow-visible p-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.id} className="flex-shrink-0">
                  <button
                    onClick={() =>
                      canNavigateToStep(index) && setCurrentStep(index)
                    }
                    disabled={!canNavigateToStep(index)}
                    className={`flex items-center w-full space-x-2 p-3 rounded-md mb-2 transition-colors ${
                      currentStep === index
                        ? "bg-white text-primary"
                        : "text-gray-700"
                    } ${
                      !canNavigateToStep(index)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-light whitespace-nowrap">{step.label}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>     

        <main className="w-full md:w- p-8 mb-4 mt-6 bg-white">
          <div className="h-[400px] overflow-y-auto">{renderStepContent()}</div>

          <hr className="mt-3" />

          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-gray-700 font-serif px-6 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 "
              >
                ← Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() =>
                  isStepComplete(currentStep) &&
                  setCurrentStep((prev) => prev + 1)
                }
                disabled={!isStepComplete(currentStep)}
                className="bg-primary text-white font-serif px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleBookAppointment}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 ml-auto"
              >
                Book Appointment
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointment;
