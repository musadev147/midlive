import React, { useEffect, useState } from 'react';
import {
  FiShoppingCart,
  FiDollarSign,
  FiRefreshCw,
  FiRepeat,
  FiCheckCircle,
  FiCreditCard,
  FiXCircle
} from 'react-icons/fi';
import axios from 'axios';
import { config } from '../../../config';

const BizView = () => {
  const [orders, setOrders] = useState([]);
  const [balance, setBalance] = useState(null);
  const [steadfast, setSteadfast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = config.apiUrl;
  const steadfastUrl = 'https://portal.packzy.com/api/v1';

  const fetchSteadfastBalance = async () => {
    if (!steadfast?.apiKey || !steadfast?.secretKey) return;

    try {
      setBalanceLoading(true);
      const response = await axios.get(`${steadfastUrl}/get_balance`, {
        headers: {
          'Api-Key': steadfast.apiKey,
          'Secret-Key': steadfast.secretKey,
        },
      });
      setBalance(response.data.current_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, sfRes] = await Promise.all([
        axios.get(`${apiUrl}/customers?lightweight=true`),
        axios.get(`${apiUrl}/steadfasts`),
      ]);

      const sfData = sfRes.data[0] || {};
      setSteadfast(sfData);

      let orderData = [];
      if (orderRes.data.customers) {
        orderData = Array.isArray(orderRes.data.customers) 
          ? orderRes.data.customers 
          : (orderRes.data.customers.data || []);
      } else if (Array.isArray(orderRes.data)) {
        orderData = orderRes.data;
      }
      
      setOrders(orderData);
    } catch (err) {
      setError('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (steadfast) {
      fetchSteadfastBalance();
    }
  }, [steadfast]);

  const getTotal = (orders) =>
    orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  const getFilteredOrders = (status) =>
    orders.filter((order) =>
      (order?.delivery_status || '').toLowerCase() === status
    );

  const delivered = getFilteredOrders('delivered');
  const returned = getFilteredOrders('return');
  const cancelled = getFilteredOrders('cancelled');
  const revenue = getTotal(delivered);

  if (loading) return <div className="text-center py-10">লোড হচ্ছে...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">📊 ব্যবসার সারাংশ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <OverviewCard
          title="মোট অর্ডার"
          value={orders.length}
          icon={<FiShoppingCart className="text-blue-600" />}
          borderColor="border-blue-600"
        />
        <OverviewCard
          title="ডেলিভার্ড অর্ডার"
          value={delivered.length}
          icon={<FiCheckCircle className="text-green-600" />}
          borderColor="border-green-600"
        />
        <OverviewCard
          title="ক্যান্সেলড অর্ডার"
          value={cancelled.length}
          icon={<FiXCircle className="text-red-600" />}
          borderColor="border-red-600"
        />
        <OverviewCard
          title="রিটার্ন অর্ডার"
          value={returned.length}
          icon={<FiRepeat className="text-yellow-600" />}
          borderColor="border-yellow-600"
        />
        <OverviewCard
          title="মোট রেভিনিউ"
          value={`৳${revenue.toLocaleString()}`}
          icon={<FiDollarSign className="text-purple-600" />}
          borderColor="border-purple-600"
        />
        <OverviewCard
          title="স্টেডফাস্ট ব্যালেন্স"
          value={
            balance !== null ? `৳${balance.toLocaleString()}` : 'লোড হচ্ছে...'
          }
          icon={
            <div className="flex items-center gap-1">
              <FiCreditCard className="text-indigo-600" />
              <button
                onClick={fetchSteadfastBalance}
                disabled={balanceLoading}
                title="রিফ্রেশ করুন"
              >
                <FiRefreshCw
                  className={`text-sm ml-1 ${
                    balanceLoading ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>
          }
          borderColor="border-indigo-600"
        />
      </div>
    </div>
  );
};

const OverviewCard = ({ title, value, icon, borderColor }) => (
  <div
    className={`bg-white p-5 rounded-lg shadow hover:shadow-md transition duration-300 border-l-4 ${borderColor} flex items-start space-x-4`}
  >
    <div className="bg-gray-100 p-3 rounded-full shadow-inner">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default BizView;
