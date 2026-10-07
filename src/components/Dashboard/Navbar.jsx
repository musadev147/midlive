import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { config } from "../../config";
import axios from "axios";
import { FaGlobe } from "react-icons/fa";
const Navbar = ({ toggleSidebar, navigate }) => {

  const apiUrl = config.apiUrl; // আপনার API URL এখানে দিন
  const [logo, setLogo] = useState([]); // ডেটা স্টেট
  const [loading, setLoading] = useState(true); // লোডিং স্টেট
  const [error, setError] = useState(null); // ত্রুটি স্টেট

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/websitelogos`); // API থেকে ডেটা ফেচ করা
        setLogo(response.data[0].logo); // ডেটা সেট করা
      } catch (error) {
        console.error("Error fetching data:", error?.data?.message || error.message); // ত্রুটি লগ করা
      } finally {
        setLoading(false); // লোডিং বন্ধ করা
      }
    };

    fetchData();
  }, []);

  // নতুন ট্যাবে হোমপেজ ওপেন করার ফাংশন
  const handleLogoClick = () => {
    window.open("/", "_blank");
  };

  return (
    <nav className="bg-white shadow-lg w-full fixed top-0 z-50 flex justify-between items-center p-4">
      {/* Logo Section */}
      <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
        <span className="text-xl font-bold text-blue-800">
          <img src={logo} alt="Logo" className="w-24 h-10" /> {/* Logo Image */}
        </span>
      </div>

      {/* Navbar Menu for Desktop */}
      <div className="hidden md:flex space-x-6 items-center">
        
          <div
            onClick={() => window.open("/", "_blank")}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-700 transition hover:cursor-pointer"
            title="Go to Homepage"
          >
            <FaGlobe className="rotate-45 text-green-400" size={18} />
          </div>

      </div>

      {/* Mobile Menu Toggle */}
      <button onClick={toggleSidebar} className="md:hidden text-blue-800">
        <FaBars size={24} />
      </button>
    </nav>
  );
};

export default Navbar;
