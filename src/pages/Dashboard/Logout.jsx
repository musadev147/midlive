import React from 'react';
import axios from 'axios';
import { config } from '../config';

const apiUrl = config.apiUrl;

const Logout = () => {
    const handleLogout = async () => {
        try {
            const response = await axios.post(`${apiUrl}/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // লোকালি স্টোর করা টোকেন পাঠানো হচ্ছে
                }
            });

            if (response.data.message) {
                // লোকাল স্টোরেজ থেকে টোকেন মুছে ফেলুন
                localStorage.removeItem('token');
                localStorage.removeItem('type');
                alert('আপনি সফলভাবে লগআউট করেছেন।');
                // লগইন পেজে রিডাইরেক্ট
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('লগআউট ব্যর্থ হয়েছে', error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;
