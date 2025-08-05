import { useEffect, useState } from "react";
import { useAuth } from "./GlobalContexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMutationMethod, getQueryMethod } from "./common/api-methods";
import type { Organization } from "./common/types";

interface RegOrgAdmin {
  email: string;
  password: string;
  organizationId: string;
  roles: string[];
}
export default function SuperAdmin() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: "",
    category: "",
    location: "",
    type: "",
    logoUrl: "",
  });

  const [orgAdminData, setOrgAdminData] = useState<RegOrgAdmin>({
    email: "",
    password: "",
    organizationId: "",
    roles: [],
  });

  const { data: orgData, refetch: refetchOrgData } = useQuery({
    queryKey: ["organizationData"],
    queryFn: () => getQueryMethod("api/organizations"),
  });

  const { mutateAsync: createOrg } = useMutation({
    mutationFn: (body: Organization) =>
      getMutationMethod("POST", `api/organizations`, body, true),
    onSuccess: () => {
      refetchOrgData();
      setFormData({
        organizationName: "",
        category: "",
        location: "",
        type: "",
        logoUrl: "",
      });
    },
  });

  const { mutateAsync: createOrgAdmin } = useMutation({
    mutationFn: (body: RegOrgAdmin) =>
      getMutationMethod("POST", `api/employees`, body, true),
    onSuccess: () => {
      setOrgAdminData({
        email: "",
        password: "",
        organizationId: "",
        roles: [],
      });
    },
  });

  useEffect(() => {
    if (user && user.role === "Admin") {
      refetchOrgData();
    }
  }, [user]);

  console.log("---orgData----", orgData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "organizationId") {
      const organization = orgData.find(
        (org: any) => Number(org?.id) === Number(value)
      );
      if (organization) {
        setOrgAdminData((prev) => ({
          ...prev,
          organizationId: organization.id,
        }));
      }
    } else {
      setOrgAdminData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    createOrg({
      name: formData.organizationName,
      logoUrl: "",
      category: "",
      location: "",
      type: "",
    });
  };

  const handleCreateOrganizationAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgAdmin({
      email: orgAdminData.email,
      password: orgAdminData.email.split("@")?.[0],
      organizationId: orgAdminData.organizationId,
      roles: ["Admin"],
    });
  };

  return (
    <div className="min-h-screen">
      <main className="">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-cover bg-center rounded-2xl overflow-hidden">
            <div className=""></div>
            <div className="m-6">
              <div className="">
                <div className="">
                  <h1 className="text-5xl lg:text-4xl font-bold mb-6 leading-tight">
                    Admin Page
                  </h1>
                </div>

                <div className="flex gap-10">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">
                      Register Organization
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="organizationName"
                        >
                          Organization Name
                        </label>
                        <div className="flex items-center border rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
                          <input
                            type="text"
                            name="organizationName"
                            id="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            className="w-full outline-none text-sm text-gray-700"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCreateOrganization}
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">
                      Add Organization Admin
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="organizationName"
                        >
                          Organization Admin Email
                        </label>

                        <div className="flex items-center border rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={orgAdminData.email}
                            onChange={(e) =>
                              handleInputChange(e.target.id, e.target.value)
                            }
                            className="w-full outline-none text-sm text-gray-700"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Request Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="organizationId"
                            name="organizationId"
                            value={orgAdminData.organizationId}
                            onChange={(e) =>
                              handleInputChange(
                                "organizationId",
                                e.target.value
                              )
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer border-gray-300`}
                          >
                            <option value="">Select organization</option>
                            {orgData?.data?.map((org: any) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                          <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                      </div>

                      <button
                        onClick={handleCreateOrganizationAdmin}
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
