import React from "react";
import { Clock, RefreshCw, LogOut } from "lucide-react";
import { useSessionExpiry } from "../common/hooks/useSessionExpiry";

const SessionExpiryWarning: React.FC = () => {
  const { showWarning, formattedTime, extendSession, dismissWarning } =
    useSessionExpiry();

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Session expiring soon
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Your session will expire in {formattedTime}. Would you like to
              continue working?
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={extendSession}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Stay signed in</span>
              </button>
              <button
                onClick={dismissWarning}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryWarning;
