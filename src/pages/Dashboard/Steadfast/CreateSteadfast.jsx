// CreateSteadfast.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { useNavigate } from "react-router-dom";

const apiUrl = config.apiUrl;

const CreateSteadfast = ({ onSteadfastCreated }) => {
  const [formData, setFormData] = useState({
    apiKey: "",
    secretKey: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // useEffect(() => {
  //   const checkSteadfastExists = async () => {
  //     try {
  //       const response = await axios.get(`${apiUrl}/steadfasts`);
  //       if (response.data.length > 0 && !hasChecked) {
  //         setHasChecked(true);
  //         if (window.confirm("Steadfast API configuration already exists! Do you want to edit it?")) {
  //           if (onSteadfastCreated) {
  //             onSteadfastCreated();
  //           } else {
  //             navigate(-1);
  //           }
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error checking Steadfast:", err.response?.data || err.message);
  //       setError("An error occurred while checking the configuration.");
  //     }
  //   };

  //   if (!hasChecked) {
  //     checkSteadfastExists();
  //   }
  // }, [apiUrl, hasChecked, onSteadfastCreated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/steadfasts`, formData);
      alert("Steadfast configuration created successfully!");
      if (onSteadfastCreated) {
        onSteadfastCreated();
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error creating Steadfast:", err.response?.data || err.message);
      setError(err.response?.data?.message || "An error occurred while creating the configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Steadfast Configuration</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key*
              </label>
              <input
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your API Key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key*
              </label>
              <input
                name="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your Secret Key"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({ apiKey: "", secretKey: "" });
                setError(null);
              }}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Configuration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSteadfast;