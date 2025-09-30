import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { authService } from "../services/authService";
import { useCountdown } from "../common/hooks/useCountdown";
import { useResetStatus } from "../common/hooks/useResetStatus";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [exchangeError, setExchangeError] = useState("");
  const [isExchanging, setIsExchanging] = useState(true);
  const [initialSeconds, setInitialSeconds] = useState(300); // 5 minutes default

  // Get token from URL
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get("token");

  const { status, loading: statusLoading } = useResetStatus(!isExchanging);

  const countdown = useCountdown({
    initialSeconds,
    onExpired: () => {
      setError("Your reset session expired. Please request a new link. 1");
    },
    autoStart: false,
  });

  // Exchange token for cookie on component mount
  useEffect(() => {
    if (token && isExchanging) {
      exchangeToken();
    } else if (!token && isExchanging) {
      setExchangeError("Invalid reset link. Please request a new one.");
      setIsExchanging(false);
    }
  }, [token]);

  // Update countdown based on status
  useEffect(() => {
    if (status.valid && status.remainingSec > 0) {
      if (countdown.timeRemaining !== status.remainingSec) {
        countdown.reset(status.remainingSec);
        if (!countdown.timeRemaining) {
          countdown.start();
        }
      }
    } else if (!status.valid && !statusLoading && !isExchanging) {
      console.log(!status.valid, !statusLoading, !isExchanging);
      setError("Your reset session expired. Please request a new link.2");
    }
  }, [status, statusLoading]);

  const exchangeToken = async () => {
    try {
      const result = await authService.exchangeToken(token!);

      if (result.ok && result.data) {
        // Clean the URL
        window.history.replaceState({}, document.title, "/reset");

        setInitialSeconds(result.data.remainingSec);
        countdown.reset(result.data.remainingSec);
        countdown.start();
        setIsExchanging(false);
      } else {
        setExchangeError(
          result.error || "Invalid reset link. Please request a new one."
        );
        setIsExchanging(false);
      }
    } catch (err) {
      setExchangeError("Failed to validate reset link. Please try again.");
      setIsExchanging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.confirmPassword(newPassword);

      if (result.ok) {
        setSuccess(true);
        countdown.stop();
      } else if (result.code === "PWRESET_WINDOW_EXPIRED") {
        setError("Your reset session expired. Please request a new link.3");
      } else {
        setError(result.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state during token exchange
  if (isExchanging) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Validating reset link...
          </h1>
          <p className="text-gray-600">
            Please wait while we verify your reset request.
          </p>
        </div>
      </div>
    );
  }

  // Exchange error state
  if (exchangeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid or expired link
          </h1>
          <p className="text-gray-600 mb-6">{exchangeError}</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Request new reset link
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Password updated!
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully changed. You can now sign in
            with your new password.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Sign in now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set new password
          </h1>
          <p className="text-gray-600">
            Choose a strong password for your account
          </p>
        </div>

        {/* Countdown timer */}
        {status.valid && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              countdown.timeRemaining < 30
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock
                className={`w-4 h-4 ${
                  countdown.timeRemaining < 30
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  countdown.timeRemaining < 30
                    ? "text-red-700"
                    : "text-blue-700"
                }`}
              >
                Time remaining: {countdown.formattedTime}
              </span>
            </div>
            {countdown.timeRemaining < 30 && (
              <p className="text-xs text-red-600 text-center mt-1">
                Complete the reset before time expires
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 12 characters long
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Confirm your new password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              {error.includes("expired") && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  Request new reset link
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !newPassword ||
              !confirmPassword ||
              countdown.isExpired
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating password...</span>
              </div>
            ) : (
              "Update password"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
