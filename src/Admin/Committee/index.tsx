// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from "react";
import { AddEditCommitteeModal } from "./AddEditCommitteeModal";
import { type Committee } from "../../common/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMutationMethod, getQueryMethod } from "../../common/api-methods";
import { CommitteeDetailView } from "./CommitteeDetailView";
import ConfirmationModal from "../../RequestDetail/ConfirmationModal";
import { useToast } from "../../GlobalContexts/ToastContext";

const CommitteePage: React.FC = () => {
  const { showToast } = useToast();
  const { data: committees, refetch: fetchCommittees } = useQuery({
    queryKey: ["committees"],
    queryFn: () => getQueryMethod("api/committees"),
  });
  const [comment, setComment] = useState("");
  console.log(comment);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  console.log("-----committees------", committees);

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");

  // State for add/edit committee modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [currentCommittee, setCurrentCommittee] = useState<Committee | null>(
    null,
  );

  const { mutateAsync: deleteCommittee } = useMutation({
    mutationFn: () =>
      getMutationMethod(
        "DELETE",
        `api/committees/${currentCommittee?.id}`,
        {},
        true,
      ),
    onSuccess: () => {
      showToast("Committee successfully removed", "success");
      setIsConfirmationModalOpen(false);
      fetchCommittees();
    },
    onError: (error: any) => {
      console.log(error?.message);
      showToast("Failed to remove committee", "error");
    },
  });

  // Open modal for editing committee
  const openEditModal = (committee: typeof currentCommittee) => {
    setModalMode("edit");
    setCurrentCommittee(committee);
    setIsModalOpen(true);
  };

  // Open modal for editing committee
  const openViewModal = (committee: typeof currentCommittee) => {
    setModalMode("view");
    setCurrentCommittee(committee);
    setIsModalOpen(true);
  };

  const openDeleteModal = (committee: typeof currentCommittee) => {
    setCurrentCommittee(committee);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDeletion = () => {
    setIsConfirmationModalOpen(false);
    deleteCommittee();
  };

  return (
    <div>
      <div className="flex justify-end mb-1">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalMode("add");
            setCurrentCommittee(null);
          }}
          type="button"
          className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Committee
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="relative ">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search committee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Committees Table */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Committee Name</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Member count</div>
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
              {committees?.map((committee: Committee) => (
                <tr key={committee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {committee.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {committee?.members?.length}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit"
                        onClick={() => openViewModal(committee)}
                      >
                        View
                      </button>

                      <button
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit"
                        onClick={() => openEditModal(committee)}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDeleteModal(committee)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        onChangeComment={setComment}
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
        }}
        onConfirm={handleConfirmDeletion}
        request={currentCommittee}
        submissionStatus="Delete"
      />

      {/* Add/Edit Committee Modal */}
      {isModalOpen && modalMode !== "view" && (
        <AddEditCommitteeModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalMode={modalMode}
          currentCommittee={currentCommittee}
          onSubmit={(closeModal) => {
            fetchCommittees();
            if (closeModal) setIsModalOpen(false);
          }}
        />
      )}

      {isModalOpen && modalMode === "view" && currentCommittee && (
        <CommitteeDetailView
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalMode={modalMode}
          selectedCommittee={currentCommittee}
        />
      )}
    </div>
  );
};

export default CommitteePage;
