import React, { useEffect, useMemo, useState } from "react";
import ModalWrapper from "../../components/modal-wrapper";
import {
  type Committee,
  type CommitteeMember,
  type Employee,
  type CommitteeRoleType,
  type CommitteeType,
  CommitteeTypeOptions,
  CommitteeRoleOptions,
} from "../../common/types";
import type { FormErrors } from "../../Dashboard/new-request";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth } from "../../GlobalContexts/AuthContext";
import { useToast } from "../../GlobalContexts/ToastContext";
import EmployeeTypeahead from "../../Request/EmployeeTypeahead";

interface AddEditCommitteeModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  modalMode: "add" | "edit" | "view";
  currentCommittee: Committee | null;
  onSubmit: (closeModal?: boolean) => void;
  // Optional: pass employees list from parent; if you already have an endpoint, you can fetch here instead
  employees?: Employee[];
}

type MemberDraft = {
  employeeId: string;
  role: CommitteeRoleType;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd or ""
  isActived: boolean;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const AddEditCommitteeModal: React.FC<AddEditCommitteeModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  currentCommittee,
  onSubmit,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [formErrors, setFormErrors] = useState<FormErrors | null>(null);
  const [formData, setFormData] = useState<Committee>({
    id: currentCommittee?.id,
    name: currentCommittee?.name ?? "",
    type: currentCommittee?.type ?? CommitteeTypeOptions[0].value,
    organizationId:
      currentCommittee?.organizationId ?? Number(user?.organizationId),
    members: currentCommittee?.members ?? [],
  });

  const [memberDraft, setMemberDraft] = useState<MemberDraft>({
    employeeId: "",
    role: CommitteeRoleOptions[0].value,
    startDate: todayISO(),
    endDate: "",
    isActived: true,
  });

  const committeeId = formData?.id;

  useEffect(() => {
    if (!isModalOpen) return;

    setFormErrors({});
    setFormData({
      id: currentCommittee?.id,
      name: currentCommittee?.name ?? "",
      type: currentCommittee?.type ?? CommitteeTypeOptions[0].value,
      organizationId:
        currentCommittee?.organizationId ?? Number(user?.organizationId),
      members: currentCommittee?.members ?? [],
    });

    setMemberDraft({
      employeeId: "",
      role: CommitteeRoleOptions[0].value,
      startDate: todayISO(),
      endDate: "",
      isActived: true,
    });
  }, [isModalOpen, currentCommittee, user?.organizationId]);

  // ---- Committee mutations ----
  const { mutateAsync: createCommittee, isPending: creatingCommittee } =
    useMutation({
      mutationFn: (body: Partial<Committee>) =>
        getMutationMethod(
          "POST",
          `api/committees`,
          { ...body, organizationId: Number(user?.organizationId) },
          true,
        ),
      onSuccess: () => {
        showToast("Committee successfully created", "success");
        onSubmit();
      },
      onError: (error: any) => {
        console.log(error?.message);
        showToast("Committee creation unsuccessful", "error");
      },
    });

  const { mutateAsync: updateCommittee, isPending: updatingCommittee } =
    useMutation({
      mutationFn: (body: Partial<Committee>) =>
        getMutationMethod(
          "PUT",
          `api/committees`,
          { ...body, organizationId: Number(user?.organizationId) },
          true,
        ),
      onSuccess: () => {
        showToast("Committee successfully updated", "success");
        onSubmit(true);
      },
      onError: (error: any) => {
        console.log(error?.message);
        showToast("Committee updating unsuccessful", "error");
      },
    });

  // ---- Member mutations (immediate backend actions) ----
  const { mutateAsync: addMember, isPending: addingMember } = useMutation({
    mutationFn: (body: Partial<CommitteeMember>) =>
      getMutationMethod("POST", `api/committees/committee-members`, body, true),
    onSuccess: () => {
      showToast("Member added", "success");
      setSelectedEmployee(null);
      onSubmit(false); // refresh parent list
    },
    onError: (error: any) => {
      console.log(error?.message);
      showToast("Failed to add member", "error");
    },
  });

  const { mutateAsync: deleteMember, isPending: deletingMember } = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      getMutationMethod(
        "DELETE",
        `api/committees/${currentCommittee?.id}/members/${memberId}`,
        {},
        true,
      ),
    onSuccess: () => {
      showToast("Member removed", "success");
      onSubmit(false); // refresh parent list
    },
    onError: (error: any) => {
      console.log(error?.message);
      showToast("Failed to remove member", "error");
    },
  });

  const isSavingCommittee = creatingCommittee || updatingCommittee;

  const handleCommitteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData?.name?.trim()) {
      setFormErrors((p) => ({ ...p, name: "Committee name is required" }));
      return;
    }

    try {
      if (modalMode === "add") {
        await createCommittee(formData);
      } else {
        await updateCommittee(formData);
      }
      setIsModalOpen(false);
    } catch {
      // handled by mutation callbacks
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...(prev ?? {}), [name]: value }) as Committee);
  };

  const members = useMemo(() => formData?.members ?? [], [formData?.members]);

  const handleAddMember = async () => {
    if (!committeeId) {
      showToast("Please save the committee first, then add members.", "error");
      return;
    }

    if (!selectedEmployee?.id) {
      showToast("Select an employee to add.", "error");
      return;
    }

    // prevent duplicates on UI side
    const exists = members.some((m) => m.employeeId === selectedEmployee?.id);
    if (exists) {
      showToast("This employee is already a member.", "error");
      return;
    }

    const optimisticMember = {
      committeeId,
      employeeId: selectedEmployee?.id,
      role: memberDraft.role,
      isActived: memberDraft.isActived,
      startDate: memberDraft.startDate,
      endDate: memberDraft.endDate,
    };

    try {
      await addMember(optimisticMember as any);
      setIsModalOpen(false);
    } catch {}
  };

  const handleDeleteMember = async (member: CommitteeMember) => {
    if (!member?.id || String(member.id).startsWith("tmp-")) {
      // if it's only local (optimistic add not yet synced), just remove locally
      setFormData((prev) => ({
        ...(prev as Committee),
        members: (prev?.members ?? []).filter((m) => m.id !== member.id),
      }));
      return;
    }

    // Optimistic remove
    const prevMembers = members;
    setFormData((prev) => ({
      ...(prev as Committee),
      members: (prev?.members ?? []).filter((m) => m.id !== member.id),
    }));

    try {
      await deleteMember({ memberId: String(member.id) });
    } catch {
      // rollback if backend fails
      setFormData((prev) => ({ ...(prev as Committee), members: prevMembers }));
    }
  };

  return (
    isModalOpen && (
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Add New Committee" : "Edit Committee"}
      >
        <form onSubmit={handleCommitteeSubmit}>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 sm:mt-0 sm:ml-4 w-full">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Committee Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    id="name"
                    value={formData?.name ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {formErrors?.name ? (
                    <p className="text-xs text-rose-600 mt-1">
                      {String(formErrors.name)}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Committee Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as CommitteeType,
                      }))
                    }
                    className="mt-1 w-full border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select Committe Type</option>
                    {CommitteeTypeOptions.map((type: any) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MEMBERS SECTION */}

                {modalMode !== "add" && (
                  <div className="border border-gray-400 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Members
                      </h3>
                      <span className="text-xs text-gray-500">
                        {members.length} total
                      </span>
                    </div>

                    {/* Members list */}
                    <div className="mt-4 divide-y border rounded-md">
                      {members.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          No members yet.
                        </div>
                      ) : (
                        members.map((m) => (
                          <div
                            key={String(m.id ?? `${m.employeeId}-${m.role}`)}
                            className="p-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {(m.employee as any)?.fullName ??
                                  (m.employee as any)?.name ??
                                  (m.employee as any)?.email ??
                                  m.employeeId}
                              </div>
                              <div className="text-xs text-gray-500">
                                Role:{" "}
                                <span className="font-medium">{m.role}</span> •
                                Start: {m.startDate?.slice(0, 10) ?? "-"}{" "}
                                {m.endDate
                                  ? `• End: ${m.endDate.slice(0, 10)}`
                                  : ""}{" "}
                                • Status: {m.isActived ? "Active" : "Inactive"}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m)}
                              disabled={deletingMember}
                              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add member controls */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <div className="sm:col-span-2">
                        <EmployeeTypeahead
                          label="Search Employee"
                          value={selectedEmployee}
                          onChange={(selected) => {
                            setSelectedEmployee?.(selected);
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          value={memberDraft.role}
                          onChange={(e) =>
                            setMemberDraft((p) => ({
                              ...p,
                              role: e.target.value as CommitteeRoleType,
                            }))
                          }
                          className="mt-1 w-full border-gray-300 rounded-md text-sm"
                          disabled={
                            !committeeId && (modalMode as string) === "add"
                          }
                        >
                          {CommitteeRoleOptions.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={memberDraft.startDate}
                          onChange={(e) =>
                            setMemberDraft((p) => ({
                              ...p,
                              startDate: e.target.value,
                            }))
                          }
                          className="mt-1 w-full border-gray-300 rounded-md text-sm"
                          disabled={
                            !committeeId && (modalMode as string) === "add"
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <div className="sm:col-span-2" />
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Active
                        </label>
                        <select
                          value={memberDraft.isActived ? "true" : "false"}
                          onChange={(e) =>
                            setMemberDraft((p) => ({
                              ...p,
                              isActived: e.target.value === "true",
                            }))
                          }
                          className="mt-1 w-full border-gray-300 rounded-md text-sm"
                          disabled={
                            !committeeId && (modalMode as string) === "add"
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700">
                          End Date (optional)
                        </label>
                        <input
                          type="date"
                          value={memberDraft.endDate}
                          onChange={(e) =>
                            setMemberDraft((p) => ({
                              ...p,
                              endDate: e.target.value,
                            }))
                          }
                          className="mt-1 w-full border-gray-300 rounded-md text-sm"
                          disabled={
                            !committeeId && (modalMode as string) === "add"
                          }
                        />
                      </div>
                      <div />
                    </div>

                    <div className="flex justify-end items-end gap-2">
                      <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={
                          addingMember ||
                          (!committeeId && (modalMode as string) === "add")
                        }
                        className="w-full inline-flex justify-center rounded-md px-3 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {addingMember ? "Adding..." : "Add member"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 mt-4 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              disabled={isSavingCommittee}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
            >
              {isSavingCommittee
                ? "Saving..."
                : modalMode === "add"
                  ? "Add Committee"
                  : "Save Changes"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </ModalWrapper>
    )
  );
};
