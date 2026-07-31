import { Link as ScrollLink } from "react-scroll";

const Header = () => {
  return (
    <div
      id="home-hero"
      className="flex flex-col md:flex-row flex-wrap bg-secondary rounded-2xl px-5 py-6 md:px-10 lg:px-20 md:py-0 overflow-hidden"
    >
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-3 md:gap-4 py-2 md:py-[10vw] md:mb-[-30px]">
        <p className="text-[11px] md:text-xs tracking-[0.14em] uppercase text-primary font-semibold">
          Book your appointment
        </p>
        <p className="text-3xl md:text-4xl lg:text-5xl text-gray-900 font-semibold leading-tight">
          <span className="md:hidden">Beautiful Nails, Expert Care</span>
          <span className="hidden md:inline">Book Appointment</span>
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-gray-600 text-sm font-light">
          <p>
            At Infinity Nail Salon, we offer a wide range of services to keep
            your nails looking their best.
            <span className="hidden sm:inline">
              {" "}
              Whether you need a quick polish or a full set of acrylics, our
              technicians are here to help.
            </span>
          </p>
        </div>
        <ScrollLink
          to="appointment-section"
          smooth={true}
          duration={400}
          className="flex items-center gap-2 cursor-pointer bg-primary px-6 py-3 rounded-xl md:rounded-full text-white text-sm mt-1 hover:opacity-95 hover:scale-[1.02] transition-all duration-300"
        >
          Book Appointment
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
          >
            <path
              fillRule="evenodd"
              d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </ScrollLink>
      </div>
      <div className="md:w-1/2 relative flex justify-center md:justify-evenly mt-4 md:mt-0">
        <img
          className="w-full max-w-sm md:w-3/4 md:absolute bottom-0 h-44 md:h-auto object-cover object-top rounded-xl md:rounded-lg"
          src="home.png"
          alt="Nail salon"
        />
      </div>
      <div className="flex md:hidden justify-center gap-1.5 w-full mt-4 mb-1">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="w-2 h-2 rounded-full bg-primary/30" />
        <span className="w-2 h-2 rounded-full bg-primary/30" />
      </div>
    </div>
  );
};

export default Header;
