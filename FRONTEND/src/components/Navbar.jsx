import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppointmentContext } from "../context/salonContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { token: contextToken, setToken: setContextToken } = useContext(AppointmentContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    setContextToken(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleNavigation = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
        <div
          onClick={() => handleNavigation("home-section")}
          className="flex items-center cursor-pointer"
        >
          <img src="logoN.png" className="w-10 h-10 ml-10" alt="logo" />
          <span className="text-md text-gray-700 ml-2">INFINITYNAILSALON</span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-start gap-5 font-medium text-gray-400">
          <li
            className="py-1 hover:text-black cursor-pointer"
            onClick={() => handleNavigation("home-section")}
          >
            HOME
          </li>
          <li
            className="py-1 hover:text-black cursor-pointer"
            onClick={() => handleNavigation("services-section")}
          >
            SERVICES
          </li>
          <li
            className="py-1 hover:text-black cursor-pointer"
            onClick={() => handleNavigation("about-section")}
          >
            ABOUT
          </li>
          <li
            className="py-1 hover:text-black cursor-pointer"
            onClick={() => handleNavigation("contact-section")}
          >
            CONTACT
          </li>
        </ul>

        {/* Profile and Mobile Menu */}
        <div className="flex items-center gap-4">
          {contextToken ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <div className="flex items-center gap-2 mr-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 rounded-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <div className="absolute top-full right-0 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 mt-2 mr-10">
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={() => navigate("/appointment")}
                    className="hover:text-black cursor-pointer"
                  >
                    Book Appointment
                  </p>
                  <p onClick={handleLogout} className="hover:text-black cursor-pointer">
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
            >
              Create account
            </button>
          )}

          {/* Mobile Menu Toggle */}
          {!contextToken && (
            <div className="relative group">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="focus:outline-none md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>

              {showMobileMenu && (
                <ul className="absolute top-14 right-0 text-base font-medium text-gray-600 z-20 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <li
                    className="p-1 cursor-pointer text-black rounded-md font-medium"
                    onClick={() => {
                      navigate("/login");
                      setShowMobileMenu(false);
                    }}
                  >
                    Sign Up
                  </li>
                  <li
                    className="p-1 cursor-pointer text-black rounded-md font-medium"
                    onClick={() => {
                      navigate("/appointment");
                      setShowMobileMenu(false);
                    }}
                  >
                    Book Appointment
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
