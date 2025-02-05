import { Link as ScrollLink } from "react-scroll";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-secondary rounded-lg px-6 md:px-10 lg:px-20">
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-3xl md:text-4xl lg:text-5xl text-black font-semibold leading-tight md:leading-tight lg:leading-tight">
          Book Appointment
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-black text-md font-light">
          <p>
            At Infinity Nail Salon, we offer a wide range of services to keep
            your nails looking their best. <br  className="hidden sm:block"/> Whether you are looking for a
            quick polish change or a full set of acrylics, our experienced
            technicians are here to help. 
          </p>
        </div >
        <ScrollLink 
          to="appointment-section"
          smooth={true}
          duration={400}
         className="flex items-center gap-2 cursor-pointer bg-primary px-8 py-3 rounded-full text-gray-200 text-sm m-auto md:m-0 hover:bg-white hover:text-black hover:scale-105 transition-all duration-300">
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
      <div className="md:w-1/2 relative flex justify-center md:justify-evenly">
        <img className="w-3/4 md:absolute bottom-0 h-auto rounded-lg" src="home.png" alt="" />
      </div>
    </div>
  );
};

export default Header;
