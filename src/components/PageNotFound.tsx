import React from "react";
import { Link } from "react-router-dom";

const PageNotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md text-center border border-gray-200">
        <div className="mb-6">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <span className="text-3xl font-bold text-red-600">404</span>
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          Sorry, the page you are looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
