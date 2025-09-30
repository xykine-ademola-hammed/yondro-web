import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Clock, RefreshCw, HelpCircle } from "lucide-react";
import { authService } from "../services/authService";
import { useCountdown } from "../common/hooks/useCountdown";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [showResend, setShowResend] = useState(false);

  const countdown = useCountdown({
    initialSeconds: 300, // 5 minutes
    onExpired: () => setShowResend(true),
    autoStart: false,
  });

  const resendCountdown = useCountdown({
    initialSeconds: 60,
    onExpired: () => setIsResending(false),
    autoStart: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authService.requestReset(email);
      setIsSubmitted(true);
      setShowResend(false);
      countdown.reset(300);
      countdown.start();

      // Show resend option after 2 minutes
      setTimeout(() => setShowResend(true), 120000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending || !resendCountdown.isExpired) return;

    setIsResending(true);
    setError("");

    try {
      await authService.resendReset(email);
      resendCountdown.reset(60);
      resendCountdown.start();
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl mb-2 font-semibold text-gray-800 text-center">
            Check your email
          </h2>

          <p className="text-gray-600 mb-6">
            If an account exists, we sent password reset instructions to{" "}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          {!countdown.isExpired && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Request cooldown: {countdown.formattedTime}
                </span>
              </div>
            </div>
          )}

          {showResend && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Didn't get the email?</p>

              <button
                onClick={handleResend}
                disabled={isResending || !resendCountdown.isExpired}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
                />
                <span>
                  {isResending
                    ? `Resending... (${resendCountdown.formattedTime})`
                    : "Resend email"}
                </span>
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setError("");
                countdown.stop();
                resendCountdown.stop();
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Try a different email
            </button>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <HelpCircle className="w-4 h-4" />
              <span>Check your spam folder or contact support</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Forgot password?
          </h2>
          <p className="text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send reset link"
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

export default ForgotPassword;
