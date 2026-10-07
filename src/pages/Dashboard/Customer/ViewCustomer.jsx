import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { config } from '../../../config';
import { useReactToPrint } from 'react-to-print';
import InvoiceTemplate from './InvoiceTemplate';
import CustomerTable from './Component/CustomerTable';
import SearchAndFilter from './Component/SearchAndFilter';
import UpdateCustomer from './UpdateCustomer';
import SalesReportModal from './Component/SalesReportModal';
import CartProductDetails from './Component/CartProductDetails';
import FraudCheck from './Component/FraudCheck';

const apiUrl = config.apiUrl;
const steadfastApiUrl = 'https://portal.packzy.com/api/v1';

const ViewCustomer = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [formData, setFormData] = useState({
    order_id: '',
    customer_name: '',
    customer_address: '',
    phone_number: '',
    product_name: '',
    color: '',
    size: '',
    quantity: '',
    total: '',
    delivery_status: '',
    delivery_note: '',
  });
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [steadfast, setSteadfast] = useState({});
  const [orderStatuses, setOrderStatuses] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [printingInvoice, setPrintingInvoice] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStatus, setShowStatus] = useState({});
  const [fraudDetails, setFraudDetails] = useState({});
  const itemsPerPage = 10;
  const invoiceRef = useRef();
  const statusCache = useRef({});

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);

  // Date range filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilterApplied, setDateFilterApplied] = useState(false);
  const [salesReport, setSalesReport] = useState(null);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderViewModal, setShowOrderViewModal] = useState(false);

  // Status options for dropdown
  const statusOptions = [
    'Confirmed',
    'Ready to Delivery',
    'Delivered',
    'Cancelled',
    'Return',
    'Hold',
    'Blocked'
  ];

  // Tab configuration
  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'new_order', label: 'New Orders' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'ready_to_delivery', label: 'Ready to Delivery' },
    { key: 'ready_to_ship', label: 'Ready to Ship' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'return', label: 'Return' },
    { key: 'hold', label: 'Hold' },
    { key: 'blocked', label: 'Blocked' }
  ];

  // Bulk status update state
  const [bulkStatus, setBulkStatus] = useState('');

  const matchesTabStatus = useCallback((app, tabKey) => {
    if (tabKey === 'all') return true;
    const actualStatus = (app?.delivery_status || '').trim().toLowerCase();
    if (tabKey === 'new_order') return actualStatus === '' || actualStatus === 'new order';

    const tabStatusMap = {
      confirmed: 'confirmed',
      ready_to_delivery: 'ready to delivery',
      ready_to_ship: 'ready to ship',
      delivered: 'delivered',
      cancelled: 'cancelled',
      return: 'return',
      hold: 'hold',
      blocked: 'blocked',
    };

    return actualStatus === tabStatusMap[tabKey];
  }, []);

  useEffect(() => {
    const fetchInitialConfig = async () => {
      try {
        const [steadfastRes] = await Promise.all([
          axios.get(`${apiUrl}/steadfasts`)
        ]);
        setSteadfast(steadfastRes.data[0] || {});
      } catch (e) {
        console.error("Config fetch error", e);
      }
    };
    fetchInitialConfig();
  }, []);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        per_page: itemsPerPage,
      };

      if (startDate && endDate && dateFilterApplied) {
        params.start_date = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        params.end_date = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      }

      let response;
      if (searchQuery) {
        response = await axios.get(`${apiUrl}/customers/search/customerdata`, {
          params: { search: searchQuery, ...params }
        });
      } else {
        response = await axios.get(`${apiUrl}/customers`, { params });
      }

      const paginationData = response?.data?.customers || response?.data || {};
      const customers = Array.isArray(paginationData)
        ? paginationData
        : (paginationData.data || []);

      setApplications(customers);
      setTotalPages(paginationData?.last_page || 1);

      setLoading(false);
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage, activeTab, dateFilterApplied]);


  const handleImageClick = (item) => {
    const quantity = Number(item?.quantity || 1);
    const unitPrice = Number(item?.price || item?.unit_price || 0);
    const lineTotal = Number(item?.total || item?.subtotal || (unitPrice > 0 ? unitPrice * quantity : 0));
    setSelectedProductDetails({
      ...item,
      price: unitPrice,
      total: lineTotal,
      images: item.product_image || item.colors?.map(c => c.image) || []
    });
    setShowProductModal(true);
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Please enter a search term (name, phone or address)');
      return;
    }
    setSearchError(null);
    setCurrentPage(1);
    fetchCustomers(1);
  };

  const handleResetSearch = async () => {
    setSearchQuery('');
    setSearchError(null);
    setCurrentPage(1);
    fetchCustomers(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`${apiUrl}/customerdelete/${id}`);
        setApplications(prev => prev.filter(app => app.id !== id));
        setSelectedApplications(prev => prev.filter(appId => appId !== id));
      } catch (err) {
        console.error("Error deleting order:", err?.response?.data?.message);
        setError("Failed to delete order. Please try again.");
      }
    }
  };

  // Filter applications by date range
  const filterByDateRange = (apps) => {
    if (!startDate || !endDate) return apps;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    return apps.filter(app => {
      const appDate = new Date(app.created_at);
      return appDate >= start && appDate <= end;
    });
  };

  // Generate sales report for the selected date range
  const generateSalesReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const filteredOrders = filterByDateRange(applications);

    const report = {
      totalOrders: filteredOrders.length,
      totalSales: filteredOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
      deliveredOrders: filteredOrders.filter(order =>
        order.delivery_status?.toLowerCase() === 'delivered').length,
      cancelledOrders: filteredOrders.filter(order =>
        order.delivery_status?.toLowerCase() === 'cancelled').length,
      pendingOrders: filteredOrders.filter(order =>
        !order.delivery_status ||
        order.delivery_status.toLowerCase() === 'not confirm' ||
        order.delivery_status.toLowerCase() === 'confirmed').length,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      orders: filteredOrders
    };

    setSalesReport(report);
    setShowSalesReport(true);
  };

  // Apply date filter
  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    setDateFilterApplied(true);
    setCurrentPage(1);
  };

  // Reset date filter
  const resetDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDateFilterApplied(false);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPoints = async (customerId) => {
    try {
      const response = await axios.post(`${apiUrl}/customers/${customerId}/add-points`);

      alert(`পয়েন্ট যোগ করা হয়েছে! যোগ হয়েছে: ${response.data.points_added}, মোট পয়েন্ট: ${response.data.total_points}`);

      const customersRes = await axios.get(`${apiUrl}/customers`);
      let customers = customersRes.data.customers || customersRes.data;
      customers = customers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setApplications(customers);

    } catch (err) {
      console.error("Error adding points:", err);
      setError(err.response?.data?.message || "Failed to add points.");
    }
  };

  // Get current page items
  const getCurrentPageItems = () => {
    return applications.filter(app => matchesTabStatus(app, activeTab));
  };

  const handleSelectAllChange = () => {
    const currentItems = getCurrentPageItems();
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(currentItems.map(app => app.id));
    }
    setSelectAll(!selectAll);
  };

  // Bulk status update function
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      alert("Please select a status first");
      return;
    }

    if (selectedApplications.length === 0) {
      alert("Please select at least one order to update status");
      return;
    }

    try {
      // Update each selected order
      await Promise.all(
        selectedApplications.map(async (id) => {
          const order = applications.find(app => app.id === id);
          if (order) {
            await axios.put(`${apiUrl}/customersupdate/${id}`, {
              ...order,
              delivery_status: bulkStatus
            });
          }
        })
      );

      // Optimistic local update
      const updatedApplications = applications.map(app =>
        selectedApplications.includes(app.id)
          ? { ...app, delivery_status: bulkStatus }
          : app
      );

      setApplications(updatedApplications);

      // Clear selection and bulk status
      setSelectedApplications([]);
      setBulkStatus('');
      setSelectAll(false);

      // Sync from backend
      await fetchCustomers(currentPage);

      alert(`Successfully updated ${selectedApplications.length} orders to ${bulkStatus}`);

    } catch (err) {
      console.error("Error updating bulk status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const handleSubmitToSteadfast = async () => {
    if (selectedApplications.length === 0) {
      alert("অন্তত একটি অর্ডার সিলেক্ট করুন");
      return;
    }

    const selectedOrders = applications
      .filter(app => selectedApplications.includes(app.id))
      .map(order => ({
        invoice: order.order_id,
        recipient_name: order.customer_name,
        recipient_address: order.customer_address,
        recipient_phone: order.phone_number,
        cod_amount: Number(order.total),
        note: order.delivery_note,
      }));

    try {
      const response = await axios.post(
        `${steadfastApiUrl}/create_order/bulk-order`,
        selectedOrders,
        {
          headers: {
            'Api-Key': steadfast.apiKey,
            'Secret-Key': steadfast.secretKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // consignment_id ডাটাবেজে আপডেট করা এবং status change to 'Ready to Ship'
      try {
        await Promise.all(
          response.data.data.map(async (orderResponse) => {
            await axios.put(`${apiUrl}/customersconsignmentupdate/${orderResponse.invoice}`, {
              consignment_id: orderResponse.consignment_id,
              delivery_status: 'Ready to Ship',
            });
          })
        );

        // লোকাল স্টেট আপডেট - অর্ডারগুলোকে 'Ready to Ship' এ আপডেট করুন
        const updatedApplications = applications.map(app => {
          if (selectedApplications.includes(app.id)) {
            return {
              ...app,
              delivery_status: 'Ready to Ship',
              consignment_id: response.data.data.find(d => d.invoice === app.order_id)?.consignment_id
            };
          }
          return app;
        });

        setApplications(updatedApplications);

        // সফলতার মেসেজ দেখানো
        alert(`সফলভাবে ${response.data.data.length}টি অর্ডার Steadfast-এ সাবমিট করা হয়েছে এবং Ready to Ship এ মুভ করা হয়েছে!`);

        // সিলেকশন ক্লিয়ার করুন
        setSelectedApplications([]);

      } catch (error) {
        console.error(error.response?.data?.message);
        alert("Consignment ID ডাটাবেজে আপডেট করতে সমস্যা হয়েছে।");
      }

    } catch (err) {
      console.error("স্ট্যাডফাস্টে সাবমিট করার সময় এরর:", err);
      let errorMessage = "অর্ডার সাবমিট করতে সমস্যা হয়েছে";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "API Key বা Secret Key ভুল";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      alert(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'new order':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'ready to delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready to ship':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'return':
        return 'bg-orange-100 text-orange-800';
      case 'hold':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch status for a single order with retry logic
  const fetchOrderStatus = async (invoice, retries = 3) => {
    try {
      const response = await axios.get(`${steadfastApiUrl}/status_by_invoice/${invoice}`, {
        headers: {
          'Api-Key': steadfast.apiKey,
          'Secret-Key': steadfast.secretKey,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      let status = response.data.delivery_status || null;

      if (status) {
        // Map Steadfast's 'cancelled' to 'Return' so it doesn't mix with manually cancelled orders
        if (status.toLowerCase() === 'cancelled') {
          status = 'Return';
        }

        statusCache.current[invoice] = status;
      }
      return status;
    } catch (err) {
      if (err.response?.status === 429 && retries > 0) {
        // Exponential backoff
        const delay = Math.pow(2, 4 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchOrderStatus(invoice, retries - 1);
      }
      console.error(`Error fetching status for invoice ${invoice}:`, err);
      return null;
    }
  };

  // Refresh all statuses for current page items
  const refreshAllStatuses = async () => {
    try {
      setRefreshLoading(true);
      const currentItems = getCurrentPageItems();
      const statusMap = {};
      let updatedCount = 0;

      for (const item of currentItems) {
        if (!item.order_id) continue;

        const newStatus = await fetchOrderStatus(item.order_id);

        if (newStatus) {
          statusMap[item.order_id] = newStatus;

          const currentStatus = item.delivery_status || '';
          // Auto update the database if the status has changed
          if (newStatus.toLowerCase() !== currentStatus.toLowerCase()) {
            try {
              await axios.put(`${apiUrl}/customersstatusupdate/${item.id}`, {
                delivery_status: newStatus
              });
              updatedCount++;
            } catch (updateErr) {
              console.error("Auto-update failed for", item.order_id, updateErr);
            }
          }
        }
      }

      setOrderStatuses(prev => ({ ...prev, ...statusMap }));
      setRefreshLoading(false);

      if (updatedCount > 0) {
        alert(`${updatedCount} orders have been automatically updated in the database.`);
      }
    } catch (err) {
      console.error("Error refreshing statuses:", err);
      setError("Failed to refresh statuses. Please try again.");
      setRefreshLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckboxChange = (id) => {
    setSelectedApplications(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleEditClick = (app) => {
    setEditingApplication(app.id);
    setFormData({
      order_id: app.order_id || '',
      customer_name: app.customer_name || '',
      customer_address: app.customer_address || '',
      phone_number: app.phone_number || '',
      product_name: app.product_name || '',
      color: app.color || '',
      size: app.size || '',
      quantity: app.quantity || '',
      total: app.total || '',
      delivery_status: app.delivery_status || '',
      delivery_note: app.delivery_note || '',
    });
  };

  // Fetch status for an order when clicked
  const fetchStatusOnClick = async (orderId) => {
    const order = applications.find(app => app.id === orderId);
    if (!order) return;

    try {
      setShowStatus(prev => ({ ...prev, [orderId]: 'loading' }));

      const status = await fetchOrderStatus(order.order_id);

      setOrderStatuses(prev => ({
        ...prev,
        [order.order_id]: status
      }));

      setShowStatus(prev => ({ ...prev, [orderId]: status }));
    } catch (err) {
      console.error("Error fetching status:", err);
      setShowStatus(prev => ({ ...prev, [orderId]: 'error' }));
    }
  };

  // Check fraud details for a customer
  const checkFraudDetails = async (phoneNumber) => {
    try {
      setFraudDetails(prev => ({ ...prev, [phoneNumber]: { loading: true } }));

      const response = await axios.get(`${steadfastApiUrl}/fraud_check/${phoneNumber}`, {
        headers: {
          'Api-Key': steadfast.apiKey,
          'Secret-Key': steadfast.secretKey,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      setFraudDetails(prev => ({
        ...prev,
        [phoneNumber]: {
          loading: false,
          data: response.data,
          isFraud: response.data.total_fraud_reports.length > 0
        }
      }));
    } catch (err) {
      console.error("Error checking fraud details:", err);
      setFraudDetails(prev => ({
        ...prev,
        [phoneNumber]: {
          loading: false,
          error: 'Error fetching fraud details'
        }
      }));
    }
  };

  // Filter applications by date range
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const handlePrintClick = (app) => {
    setPrintingInvoice(app);
    setShowPrintPreview(true);
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/customers`, { params: { export_csv: true, status: activeTab } });
      const data = response.data.customers;
      if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
      }

      let csvContent = "Name,Phone\n";
      data.forEach(row => {
        csvContent += `${(row.customer_name || '').replace(/,/g, '')},${row.phone_number || ''}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `customers_${activeTab}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/customersupdate/${editingApplication}`, formData);
      setApplications(prev =>
        prev.map(app => (app.id === editingApplication ? { ...app, ...formData } : app))
      );
      setEditingApplication(null);
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.response?.data?.message || "Failed to update order.");
    }
  };

  const currentItems = getCurrentPageItems();
  const todayDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  const totalAmount = currentItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const confirmedOrders = currentItems.filter(item => (item.delivery_status || '').toLowerCase() === 'confirmed').length;
  const formatDateTime = (value) => new Date(value).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const getItemImage = (item) => {
    if (Array.isArray(item?.images) && item.images.length > 0) return item.images[0];
    if (item?.product_image) return item.product_image;
    if (Array.isArray(item?.colors) && item.colors.length > 0 && item.colors[0]?.image) return item.colors[0].image;
    return null;
  };

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const getItemAmount = (item) => {
    const quantity = toNumber(item?.quantity || 1);
    const total = toNumber(item?.total);
    const subtotal = toNumber(item?.subtotal);
    const unitPrice = toNumber(item?.price || item?.unit_price);

    if (total > 0) return total;
    if (subtotal > 0) return subtotal;
    if (unitPrice > 0) return unitPrice * (quantity || 1);
    return null;
  };

  const openOrderView = (order) => {
    setSelectedOrder(order);
    setShowOrderViewModal(true);
  };

  const orderViewItems = selectedOrder?.items?.length
    ? selectedOrder.items
    : selectedOrder
      ? [{
        id: selectedOrder.id,
        product_name: selectedOrder.product_name,
        quantity: selectedOrder.quantity,
        color: selectedOrder.color,
        size: selectedOrder.size,
        total: selectedOrder.total,
        product_image: selectedOrder.product_image,
      }]
      : [];

  return (
    <div className="p-4 md:p-6 max-w-[96rem] mx-auto">
      <CartProductDetails
        showProductModal={showProductModal}
        selectedProductDetails={selectedProductDetails}
        setShowProductModal={setShowProductModal}
      />
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onResetSearch={handleResetSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onApplyDateFilter={applyDateFilter}
        onGenerateReport={generateSalesReport}
        onResetDateFilter={resetDateFilter}
        dateFilterApplied={dateFilterApplied}
        searchError={searchError}
      />

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Today&apos;s date</p>
            <p className="text-2xl font-bold text-gray-900">{todayDate}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Total Orders (Confirmed)</p>
            <p className="text-2xl font-bold text-gray-900">{confirmedOrders}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">{'\u09F3'}{totalAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Total Customer Served</p>
            <p className="text-2xl font-bold text-gray-900">{currentItems.length}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Customer Orders</h2>

          {/* Bulk Status Update Section - Right side of Customer Orders */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Bulk Status Update */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Update Status:</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || selectedApplications.length === 0}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update ({selectedApplications.length})
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={loading}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export CSV
              </button>
              <button
                onClick={refreshAllStatuses}
                disabled={refreshLoading}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {refreshLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              <button
                onClick={handleSubmitToSteadfast}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                disabled={selectedApplications.length === 0}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                Steadfast ({selectedApplications.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <nav className="inline-flex rounded-xl bg-gray-100 p-1 whitespace-nowrap">
            {tabs.map(tab => {
              // Tab Navigation section-এ count calculation ঠিক করুন              
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-medium ${activeTab === tab.key ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <CustomerTable
          currentItems={currentItems}
          selectedApplications={selectedApplications}
          handleCheckboxChange={handleCheckboxChange}
          handleEditClick={handleEditClick}
          handlePrintClick={handlePrintClick}
          handleDeleteClick={handleDelete}
          handleAddPoints={handleAddPoints}
          getStatusColor={getStatusColor}
          showStatus={showStatus}
          orderStatuses={orderStatuses}
          fetchStatusOnClick={fetchStatusOnClick}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          activeTab={activeTab}
          selectAll={selectAll}
          handleSelectAllChange={handleSelectAllChange}
          onViewOrder={openOrderView}
        />
      </div>

      {showOrderViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Details - #{selectedOrder.order_id || selectedOrder.id}</h3>
              <button onClick={() => setShowOrderViewModal(false)} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
                  <p className="mt-1 font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.phone_number}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_address}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Order Info</p>
                  <p className="mt-1 text-sm text-gray-700">Amount: <span className="font-semibold text-gray-900">৳{selectedOrder.total}</span></p>
                  <p className="text-sm text-gray-700">Status: <span className="font-semibold text-gray-900">{selectedOrder.delivery_status || 'Placed'}</span></p>
                  <p className="text-sm text-gray-700">Type: <span className="font-semibold text-gray-900">{selectedOrder.order_type || 'product'}</span></p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <FraudCheck
                  phoneNumber={selectedOrder.phone_number}
                  fraudDetails={fraudDetails}
                  checkFraudDetails={checkFraudDetails}
                />
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-800">Orderable Items</h4>
                {orderViewItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No item details available for this order.</p>
                ) : (
                  <div className="space-y-3">
                    {orderViewItems.map((item, idx) => {

                      console.log('log', item);
                      const imageSrc = getItemImage(item);
                      return (
                        <button
                          key={item.id || idx}
                          onClick={() => handleImageClick(item)}
                          className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            {imageSrc ? (
                              <img src={imageSrc} alt={item.product_name || `Item ${idx + 1}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">No Image</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{item.product_name || `Item ${idx + 1}`}</p>
                            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                              <p>Qty: <span className="font-medium text-gray-800">{item.quantity || 1}</span></p>
                              <p>Color: <span className="font-medium text-gray-800">{item.color || 'N/A'}</span></p>
                              <p>Size: <span className="font-medium text-gray-800">{item.size || 'N/A'}</span></p>
                              <p>
                                Amount:{' '}
                                <span className="font-medium text-gray-800">
                                  {getItemAmount(item) !== null ? `${'\u09F3'}${getItemAmount(item)}` : 'N/A'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SalesReportModal
        isOpen={showSalesReport}
        onClose={() => setShowSalesReport(false)}
        report={salesReport}
        onExportCSV={() => {
          const csvContent = [
            ['Order ID', 'Date', 'Customer', 'Phone', 'Amount', 'Status'],
            ...salesReport.orders.map(order => [
              order.order_id,
              formatDateTime(order.created_at),
              order.customer_name,
              order.phone_number,
              order.total,
              order.delivery_status || 'New Order'
            ])
          ].map(e => e.join(",")).join("\n");

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `sales_report_${salesReport.startDate}_to_${salesReport.endDate}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      />

      {editingApplication && (
        <UpdateCustomer
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setEditingApplication={setEditingApplication}
        />
      )}

      {showPrintPreview && printingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Invoice Preview</h3>
              <div className="space-x-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <InvoiceTemplate
                ref={invoiceRef}
                order={printingInvoice}
                logoUrl="/images/logo.png"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCustomer;





