import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { AppointmentContext } from "../context/salonContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    token: contextToken,
    setToken: setContextToken,
    user,
    setUser,
  } = useContext(AppointmentContext);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setContextToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setShowProfileMenu(false);
    navigate("/");
  };

  const handleNavigation = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between text-sm py-3 md:py-4 md:mb-5 md:border-b md:border-b-gray-200">
        <div
          onClick={() => handleNavigation("home-section")}
          className="flex items-center cursor-pointer pl-1 md:pl-0"
        >
          <img src="logoN.png" className="w-9 h-9 md:w-10 md:h-10 md:ml-10" alt="logo" />
          <span className="text-sm md:text-md text-gray-800 ml-2 font-semibold tracking-wide uppercase">
            InfinityNailSalon
          </span>
        </div>

        <ul className="hidden md:flex items-start gap-5 font-medium text-gray-400">
          <li className="py-1 hover:text-black cursor-pointer" onClick={() => handleNavigation("home-section")}>
            HOME
          </li>
          <li className="py-1 hover:text-black cursor-pointer" onClick={() => handleNavigation("services-section")}>
            SERVICES
          </li>
          <li className="py-1 hover:text-black cursor-pointer" onClick={() => navigate("/blog")}>
            BLOG
          </li>
          <li className="py-1 hover:text-black cursor-pointer" onClick={() => navigate("/contact")}>
            CONTACT
          </li>
        </ul>

        <div className="relative flex items-center gap-3 pr-1 md:pr-4">
          {contextToken ? (
            <>
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="p-2 rounded-full hover:bg-stone-100 text-gray-700"
                aria-label="Account"
              >
                <User className="w-6 h-6" />
              </button>
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 min-w-48 bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col gap-1 p-2 z-30">
                  {isAdmin ? (
                    <button
                      type="button"
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-gray-700 font-medium"
                      onClick={() => {
                        navigate("/admin");
                        setShowProfileMenu(false);
                      }}
                    >
                      Admin Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-gray-700"
                        onClick={() => {
                          navigate("/my-appointments");
                          setShowProfileMenu(false);
                        }}
                      >
                        My Appointments
                      </button>
                      <button
                        type="button"
                        className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-gray-700"
                        onClick={() => {
                          navigate("/appointment");
                          setShowProfileMenu(false);
                        }}
                      >
                        Book Appointment
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-gray-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="md:hidden p-2 rounded-full hover:bg-stone-100 text-gray-700"
                aria-label="Sign in"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
