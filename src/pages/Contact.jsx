import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { config } from '../config';


const apiUrl = config.apiUrl; // API URL কনফিগারেশন থেকে নিয়ে আসা
const Contact = () => {

const [contactInfo, setContactInfo] = useState([]); // API থেকে ডেটা সেট করার জন্য স্টেট
const [loading, setLoading] = useState(true); // লোডিং স্টেট
const [error, setError] = useState(null); // ত্রুটি স্টেট
const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: false,
}); 


const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await axios.post(`${apiUrl}/contacts`, formData);

        alert('আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে!');
        setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
            status: false,
        });
      } catch (error) {
        console.error('Error creating item:', error);
      }

  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/contactinfos`); // API থেকে ডেটা ফেচ করা  
        setContactInfo(response.data[0]); // ডেটা সেট করা
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // লোডিং বন্ধ করা
      }
    };

    fetchData();
  }, []);


  return (
    <>
        {/* হেডার সেকশন */}
        <Header />
        {/* Category Banner */}
        <div className="bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-10 text-center text-white">

        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="mt-2 text-lg">
            <Link to="/" className="hover:underline">Home</Link> / Contact
        </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12">আমাদের সাথে যোগাযোগ করুন</h1>
        
        {/* কার্ড সেকশন */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* ১ম কার্ড - হেড অফিস */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center hover:bg-green-50 transition-colors duration-300">
            <div className="bg-blue-100 p-4 rounded-full mb-4 hover:bg-green-100">
                <FaMapMarkerAlt className="text-blue-600 text-2xl hover:text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">হেড অফিস</h3>
            <p className="text-gray-600">{contactInfo.address}</p>
            </div>

            {/* ২য় কার্ড - ফোন নাম্বার (সবুজ ব্যাকগ্রাউন্ড) */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
                <FaPhone className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ফোন নাম্বার</h3>
            <p className="text-gray-600">{contactInfo.phone}</p>
            </div>

            {/* ৩য় কার্ড - সাপোর্ট মেইল */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center hover:bg-green-50 transition-colors duration-300">
            <div className="bg-purple-100 p-4 rounded-full mb-4 hover:bg-green-100">
                <FaEnvelope className="text-purple-600 text-2xl hover:text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">সাপোর্ট মেইল</h3>
            <p className="text-gray-600">{contactInfo.email}</p>
            </div>
        </div>

        {/* ম্যাপ এবং ফর্ম সেকশন */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* গুগল ম্যাপ - পুরান বাজার, মাদারীপুর */}
            <div className="h-full">
            <h2 className="text-2xl font-bold mb-6">আমাদের অবস্থান</h2>
            <div className="bg-gray-200 h-full rounded-lg overflow-hidden shadow-lg">
                <iframe
                title="আমাদের অবস্থান"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.441512267786!2d90.1892143154341!3d23.1058577185685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37556f68b24ea1a9%3A0x940986680bffc301!2sCity%20Super%20Market%2C%20Madaripur!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd"
                ></iframe>
            </div>
            </div>

            {/* কন্টাক্ট ফর্ম */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">মেসেজ পাঠান</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">আপনার নাম*</label>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">ইমেইল*</label>
                    <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    />
                </div>
                </div>
                <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-700 mb-2">ফোন নাম্বার</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                </div>
                <div className="mb-6">
                <label htmlFor="subject" className="block text-gray-700 mb-2">বিষয়*</label>
                <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
                </div>
                <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 mb-2">আপনার মেসেজ*</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                ></textarea>
                </div>
                <button
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors w-full md:w-auto"
                >
                মেসেজ পাঠান
                </button>
            </form>
            </div>
        </div>
    </div>
    <Footer />
    </>
  );
};

export default Contact;