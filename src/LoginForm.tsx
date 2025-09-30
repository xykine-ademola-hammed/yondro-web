import React, { useState } from "react";
import { useAuth } from "./GlobalContexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "./GlobalContexts/ToastContext";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { user, login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Replace with your login logic
    const result = await login(formData.email.trim(), formData.password.trim());
    if (!result.success) {
      showToast("Invalid credentials", "error");
    }
  };

  if (user?.id) return null;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Login
      </h2>
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <div className="flex items-center border rounded-md shadow-sm  focus-within:ring-indigo-500">
            {/* <FaEnvelope className="text-gray-400 mr-2" /> */}
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full outline-none text-sm text-gray-700"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="password"
          >
            Password
          </label>
          <div className="flex items-center border rounded-md shadow-sm  focus-within:ring-indigo-500">
            {/* <FaLock className="text-gray-400 mr-2" /> */}
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full outline-none text-sm text-gray-700"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>
        {/* Forgot Password + Submit */}
        <div className="flex justify-between items-center text-sm">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-indigo-600 hover:underline"
          >
            Reset password
          </button>
        </div>

        <button
          onClick={handleSubmit}
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
