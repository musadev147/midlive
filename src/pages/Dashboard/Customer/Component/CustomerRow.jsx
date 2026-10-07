import React from 'react';
import { FaEdit, FaEye, FaPrint, FaTrash } from 'react-icons/fa';

const CustomerRow = ({
  app,
  selected,
  onCheckboxChange,
  onEditClick,
  onPrintClick,
  onDeleteClick,
  onAddPointsClick,
  getStatusColor,
  showStatus,
  orderStatuses,
  fetchStatusOnClick,
  activeTab,
  onViewOrder,
}) => {
  const statusValue = orderStatuses[app.order_id] || showStatus[app.id] || app.delivery_status || 'Placed';
  const orderType = app.order_type || 'product';
  const formattedCreatedAt = new Date(app.created_at).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <tr className={selected ? 'bg-violet-50' : 'hover:bg-gray-50'}>
      <td className="whitespace-nowrap px-3 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onCheckboxChange(app.id)}
          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
      </td>

      <td className="px-3 py-4">
        <div className="font-semibold text-gray-900">#{app.order_id || app.id}</div>
        <div className="text-xs text-gray-500">{app.order_type === 'lab_test' ? 'Lab order' : 'Order'}</div>
      </td>

      <td className="px-3 py-4">
        <div className="font-medium text-gray-900">{app.customer_name}</div>
        <div className="text-sm text-gray-500">{app.phone_number}</div>
      </td>

      <td className="px-3 py-4 text-sm text-gray-700">
        {formattedCreatedAt}
      </td>

      <td className="px-3 py-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(statusValue)}`}>
          {statusValue}
        </span>
      </td>

      <td className="px-3 py-4 text-sm text-gray-700 capitalize">{orderType.replace('_', ' ')}</td>

      <td className="px-3 py-4 text-sm font-semibold text-gray-900">{'\u09F3'}{app.total}</td>

      <td className="px-3 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewOrder(app)}
            className="rounded-md bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            Order View
          </button>
          <button
            onClick={() => fetchStatusOnClick(app.id)}
            className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100"
            title="Check Status"
          >
            <FaEye className="text-xs" />
          </button>
          <button
            onClick={() => onEditClick(app)}
            className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            title="Edit"
          >
            <FaEdit className="text-[10px]" />
            Edit
          </button>
          <button
            onClick={() => onPrintClick(app)}
            className="inline-flex items-center gap-1 rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
            title="Print"
          >
            <FaPrint className="text-[10px]" />
            Print
          </button>
          <button
            onClick={() => onDeleteClick(app.id)}
            className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            title="Delete"
          >
            <FaTrash className="text-[10px]" />
            Delete
          </button>
          {!app.delivery_status && activeTab === 'delivered' && (
            <button onClick={() => onAddPointsClick(app.id)} className="text-xs font-medium text-green-600 hover:text-green-900">Points</button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default CustomerRow;

