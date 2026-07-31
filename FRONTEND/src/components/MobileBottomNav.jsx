import { Home, LayoutGrid, CalendarDays, BookOpen, User } from "lucide-react";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppointmentContext } from "../context/salonContext";

const items = [
  { id: "home", label: "Home", icon: Home, path: "/", section: "home-section" },
  { id: "services", label: "Services", icon: LayoutGrid, path: "/", section: "services-section" },
  { id: "book", label: "Book", icon: CalendarDays, path: "/", section: "appointment-section", prominent: true },
  { id: "blog", label: "Blog", icon: BookOpen, path: "/blog" },
  { id: "account", label: "Account", icon: User, path: "/my-appointments" },
];

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AppointmentContext);

  const go = (item) => {
    if (item.id === "account") {
      navigate(token ? "/my-appointments" : "/login");
      return;
    }
    if (item.path === "/" && item.section) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(item.section)?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        document.getElementById(item.section)?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    navigate(item.path);
  };

  const isActive = (item) => {
    if (item.id === "home") return location.pathname === "/";
    if (item.id === "book") return location.pathname === "/appointment";
    if (item.id === "blog") return location.pathname === "/blog" || location.pathname === "/about";
    if (item.id === "account") {
      return location.pathname === "/my-appointments" || location.pathname === "/login";
    }
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-end justify-between px-2 pt-2 pb-2 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          if (item.prominent) {
            return (
              <li key={item.id} className="-mt-5">
                <button
                  type="button"
                  onClick={() => go(item)}
                  className="flex flex-col items-center gap-1"
                  aria-label={item.label}
                >
                  <span className="bg-primary text-white rounded-2xl p-3.5 shadow-md shadow-primary/30">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-medium text-primary">{item.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item)}
                className={`flex flex-col items-center gap-1 min-w-[52px] ${
                  active ? "text-primary" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
