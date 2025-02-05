import { useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      } else {
        console.log("Section not Found:", sectionId);
      }
    }
  };

  return (
    <div className="mt-40">
      <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-8 my-10 text-sm">
        {/* Logo and Navigation */}
        <div onClick={() => handleNavigation("home-section")} className="flex items-center cursor-pointer justify-center sm:justify-start">
          <img src="logoN.png" className="w-8 h-8" alt="logo" />
          <span className="text-md text-gray-700 ml-2">INFINITYNAILSALON</span>
        </div>

        {/* Social Media Links */}
        <div>
          <p className="text-xl font-medium mb-2">SOCIALS</p>
          <div className="flex gap-4 justify-center md:justify-start">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-gray-600 hover:text-blue-600" size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-gray-600 hover:text-blue-400" size={20} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <FaTiktok className="text-gray-600 hover:text-black" size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-gray-600 hover:text-pink-500" size={20} />
            </a>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <p className="text-xl font-medium mb-2">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li onClick={() => handleNavigation("home-section")} className="cursor-pointer">Home</li>
            <li onClick={() => handleNavigation("about-section")} className="cursor-pointer">About</li>
            <li className="cursor-pointer">Blog</li>
            <li className="cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <p className="text-xl font-medium mb-2">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>0110033347</li>
            <li>contact@infinitynailsalon1.com</li>
          </ul>
          <p className="font-medium mt-1">Address</p>
          <p className="text-gray-600">At the junction of Joseph Kang&apos;ethe Road & Suna Road - Near Junction Pharmacy</p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright 2024 @infinitynailsalon.com - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
