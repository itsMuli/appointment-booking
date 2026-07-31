import { Link as ScrollLink } from "react-scroll";

const Header = () => {
  return (
    <div
      id="home-hero"
      className="relative flex flex-col md:flex-row flex-wrap bg-secondary rounded-2xl p-5 md:px-10 lg:px-20 md:py-0 overflow-hidden max-md:min-h-0"
    >
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 md:gap-4 py-0 md:py-[10vw] md:mb-[-30px] z-10">
        <p className="text-[11px] md:text-xs tracking-[0.14em] uppercase text-primary font-semibold">
          Book your appointment
        </p>
        <p className="text-[34px] leading-[1.15] md:text-4xl lg:text-5xl text-gray-900 font-semibold md:leading-tight">
          Book Appointment
        </p>
        <div className="text-gray-600 text-sm font-light max-w-prose">
          <p className="line-clamp-3 md:line-clamp-none">
            At Infinity Nail Salon, we offer a wide range of services to keep
            your nails looking their best. Whether you are looking for a quick
            polish change or a full set of acrylics, our experienced
            technicians are here to help.
          </p>
        </div>
        <ScrollLink
          to="appointment-section"
          smooth={true}
          duration={400}
          className="flex items-center justify-center gap-2 cursor-pointer bg-primary w-[90%] md:w-auto px-6 py-3.5 rounded-xl md:rounded-full text-white text-sm mt-1 hover:opacity-95 hover:scale-[1.02] transition-all duration-300"
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

      <div className="md:w-1/2 relative flex justify-end md:justify-evenly mt-4 md:mt-0 max-md:-mb-2">
        <img
          className="w-[78%] max-w-[280px] md:w-3/4 md:max-w-none md:absolute bottom-0 right-0 md:right-auto h-40 md:h-auto object-cover object-top rounded-xl md:rounded-lg max-md:translate-x-1"
          src="home.png"
          alt="Nail salon"
        />
      </div>
    </div>
  );
};

export default Header;
