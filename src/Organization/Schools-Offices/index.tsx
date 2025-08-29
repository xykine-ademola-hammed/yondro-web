// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import Pagination from "../../components/Pagination";

const SchoolOfficePage: React.FC = () => {
  const { schoolOffices } = useOrganization();
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePageChange = (pageNumber: number) => {
    setOffset(pageNumber);
  };

  return (
    <>
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
          <div className="m-2">
            {/* <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-plus mr-2"></i>
              Add School/Office
            </button> */}
          </div>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                className="bg-gray-100 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border-none rounded-md text-sm"
                placeholder="Search schoolOffices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* SchoolOffices Table */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">School | Office</div>
                </th>

                <th
                  scope="col"
                  className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex">Finance Code</div>
                </th>

                <th
                  scope="col"
                  className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Department #</div>
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolOffices?.rows?.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {department.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{department?.financeCode}</td>
                  <td>{department?.departments?.length}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit"
                        // onClick={() => openEditModal(department)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>

                      <button
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={offset}
          itemsPerPage={10}
          totalItems={schoolOffices.count}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};
export default SchoolOfficePage;
