"use client";

import { useState } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";
import { useToast } from "../GlobalContexts/ToastContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phone: user?.phone,
    position: user?.position?.title,
    department: user?.department?.name,
  });

  const [tempData, setTempData] = useState(profileData);

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("PUT", `api/employee/${user?.id}`, body, true),
    onSuccess: (data) => {
      updateUser(data?.data);
      showToast("Employee update successful", "success");
    },
    onError: (error) => {
      showToast(`Employee update failed: ${error.message}`, "error");
    },
  });

  const handleEdit = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(tempData);
    setProfileData(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {profileData?.firstName?.[0]}
                  {profileData?.lastName?.[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {profileData.position}
                  </p>
                  <p className="text-blue-200">
                    {profileData.department} Department
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-save-line mr-2"></i>
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.firstName}
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="py-2 text-gray-900">
                        {profileData.firstName}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="py-2 text-gray-900">
                        {profileData.lastName}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-900">
                      {profileData.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-900">
                      {profileData.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Summary */}
              {/* <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Activity Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">28</div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">Forms Submitted</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-gray-600">
                      Workflows Active
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      96%
                    </div>
                    <div className="text-sm text-gray-600">On-time Rate</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
