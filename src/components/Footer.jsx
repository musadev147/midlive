import React, { useContext } from "react";
import { 
  FaFacebook, 
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaGithub,
  FaTelegram,
  FaGlobe,
  FaLinkedin,
  FaPinterest, 
  FaTwitter, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaThreads,
  FaSoundcloud,
  FaSnapchat,
  FaTiktok,
  FaReddit,
  FaTumblr,
  FaVimeo,
  FaFlickr,
  FaBehance,
  FaDribbble,
  FaDiscord,
  FaSlack,
  FaSpotify,
  FaMedium,
  FaQuora,
  FaWeibo,
  FaWeChat,
  FaQQ,
  FaXing,
  FaMastodon,
  FaClubhouse,
  FaEllo,
  FaBlogger,
  FaTypeform,
  FaSurveyMonkey,
  FaMailchimp,
  FaKickstarter,
  FaPatreon,
  FaSubstack,

} from "react-icons/fa";
import * as FaIcons from "react-icons/fa";

import { HeaderContext } from "../context/HeaderContext";
import AppLogo from "./AppLogo";



const Footer = () => {

  // Footer Logo, Menu, Social Links, Contact Info
  const { logo, contactInfo, socialLinks, footerMenus, legalPages } = useContext(HeaderContext);
  

  return (
    <footer className="bg-gradient-to-r from-[#1a3453] to-[#001f41] text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Logo, Text & Social Icons */}
        <div>
          
          <AppLogo className="w-48" />
          <p className="text-gray-400 mt-2">
            {logo.brand_slogan}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {socialLinks.map((link, index) => {
              const IconComponent = FaIcons[link.icon_class];
              return (
                <a
                  key={index}
                  href={link.url}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
                >
                  {IconComponent && <IconComponent size={18} />}
                </a>
              );
            })}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            {(legalPages?.length ? legalPages : footerMenus).map((menu, index) => (
              <li key={menu.id || index}>
                <a
                  href={legalPages?.length ? `/legal/${menu.slug}` : menu.url}
                  className="hover:text-white"
                >
                  {menu.title || menu.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Us */}


        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="flex items-center text-gray-400">
            <FaMapMarkerAlt className="text-green-500 mr-2" /> 
            {contactInfo.address}
          </p>
          <p className="flex items-center text-gray-400 mt-2">
            <FaPhone className="text-green-500 mr-2" /> 
            {contactInfo.phone}
          </p>
          <p className="flex items-center text-gray-400 mt-2">
            <FaEnvelope className="text-green-500 mr-2" /> 
            {contactInfo.email}
          </p>
        </div>

      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-600 mt-6 pt-4 text-center text-gray-300">
        ï¿½ All rights Reserved by{' '}
        <span className="font-semibold text-white"><a href="#">Medivila</a></span>{' '}
        | Developed by{' '}
        <span className="font-semibold text-white">
          <a href="#" target="_blank" rel="noreferrer">
            Sarjid Islam Habil
          </a>
        </span>
      </div>

    </footer>
  );
};

export default Footer;

