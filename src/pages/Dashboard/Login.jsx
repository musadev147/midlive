import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from "../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const apiUrl = config.apiUrl;

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isEmailUser = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.remember_token;
      const type = response.data.type;

      localStorage.setItem("token", token);
      localStorage.setItem("type", type);

      if (type === "admin" || type === "moderator") {
        navigate("/dashboard");
      } else if (type === "user") {
        if (isEmailUser(formData.email)) {
          alert("Your account is not approved yet.");
        } else {
          navigate("/");
        }
      } else {
        alert("Your account is not approved yet.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Login to continue to your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              Email or Phone
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white
              border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter email or phone"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white
                border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition
            bg-gradient-to-r from-green-500 to-emerald-600
            hover:from-green-600 hover:to-emerald-700
            text-white shadow-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        {/* <div className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?
          <button
            onClick={() => navigate("/register")}
            className="ml-2 text-green-400 hover:underline"
          >
            Register
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;