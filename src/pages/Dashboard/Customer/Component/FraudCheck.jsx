import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const FraudCheck = ({ phoneNumber, fraudDetails, checkFraudDetails }) => {
  const currentDetails = fraudDetails[phoneNumber] || {};
  const hasFraudReports = (currentDetails.data?.total_fraud_reports?.length || 0) > 0;
  const totalParcels = currentDetails.data?.total_parcels || currentDetails.data?.total_orders || 0;
  const totalDelivered = currentDetails.data?.total_delivered || 0;
  const totalCancelled = currentDetails.data?.total_cancelled || 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-slate-900 p-2 text-white">
              <FaShieldAlt className="text-xs" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Fraud Verification</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">Phone: {phoneNumber || 'N/A'}</p>
        </div>

        <div className="flex items-center gap-2">
          {currentDetails.data && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                hasFraudReports ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {hasFraudReports ? <FaExclamationTriangle className="text-[10px]" /> : <FaCheckCircle className="text-[10px]" />}
              {hasFraudReports ? 'Risk Found' : 'No Risk'}
            </span>
          )}

          <button
            onClick={() => checkFraudDetails(phoneNumber)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={currentDetails.loading}
          >
            <FaExclamationTriangle className="text-[11px]" />
            {currentDetails.loading ? 'Checking...' : 'Check Fraud Details'}
          </button>
        </div>
      </div>

      {currentDetails.loading && (
        <div className="mt-3 inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          <svg className="mr-2 h-3.5 w-3.5 animate-spin text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Fetching verification data...
        </div>
      )}

      {currentDetails.data && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] text-slate-500">Total Parcels</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{totalParcels}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] text-slate-500">Delivered</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{totalDelivered}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] text-slate-500">Cancelled</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">{totalCancelled}</p>
            </div>

            <div className={`rounded-xl border p-3 ${hasFraudReports ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className="text-[11px] text-slate-500">Fraud Reports</p>
              <p className={`mt-1 text-lg font-semibold ${hasFraudReports ? 'text-red-700' : 'text-emerald-700'}`}>
                {hasFraudReports ? currentDetails.data.total_fraud_reports.length : 0}
              </p>
            </div>
          </div>

          {hasFraudReports && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-red-800">Fraud Response</h4>
              <div className="space-y-1.5 text-xs text-red-700">
                {currentDetails.data.total_fraud_reports.map((report, index) => (
                  <p key={index} className="rounded-md bg-white/70 px-2.5 py-2">
                    {report.reason || report.message || report}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentDetails.error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {currentDetails.error}
        </div>
      )}
    </div>
  );
};

export default FraudCheck;
