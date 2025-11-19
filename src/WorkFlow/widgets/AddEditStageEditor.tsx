import { useEffect, useState } from "react";
import type {
  ApiFilter,
  Position,
  PositionData,
  StageData,
} from "../../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import useForm from "../../common/hooks/useForms";
import type { FormProps } from "../../common/hooks/useForms";
import type { FormErrors } from "../../Dashboard/new-request";
import { useAuth } from "../../GlobalContexts/AuthContext";

interface AddEditStageEditorProps {
  formDataStages?: WorkFlowStage[];
  selectedStage: WorkFlowStage;
  setIsOpenStageModal: (isOpen: boolean) => void;
  onSubmit: (stageIndex: number, stageData: WorkFlowStage) => void;
  selectedStageIndex: number;
  formId: string;
}

export interface SplitPosition {
  id?: number;
  title: string;
  responseType?: string;
}

export interface WorkFlowStage {
  id?: number | undefined;
  name?: string;
  instruction?: string;
  isSubStage?: boolean;
  isRequestor?: boolean;
  hasSplitAssignee?: boolean;
  isRequestorParent?: boolean;
  triggerVoucherCreation?: boolean;
  assigneePositionId?: string;
  assigineeLookupField?: string;
  formFields: any[];
  formSections?: any[];
  organizationId?: number | string;
  departmentId?: number | string;
  step?: number;
  parentStageId?: number;
  description?: string;
  stages?: StageData[];
  assignToRequestor?: any;
  assignee?: any;
  fields: any[];
  status?: string;
  splitPositions?: SplitPosition[];
  responseTypes?: string[];
  isResubmissionStage?: boolean;
  isPriorityComment?: boolean;
}

export const emptyStageData: WorkFlowStage = {
  id: undefined,
  name: "",
  instruction: "",
  isSubStage: false,
  isRequestor: false,
  hasSplitAssignee: false,
  splitPositions: [],
  assigneePositionId: undefined,
  assigineeLookupField: "",
  formFields: [],
  formSections: [],
  fields: [],
};

export default function AddEditStageEditor({
  formDataStages,
  selectedStage,
  setIsOpenStageModal,
  onSubmit,
  selectedStageIndex,
  formId,
}: AddEditStageEditorProps) {
  const { user } = useAuth();
  const [positionData, setPositionData] = useState<PositionData>();
  const [formData, setStageData] = useState<WorkFlowStage>({
    ...selectedStage,
    responseTypes: selectedStage.responseTypes ?? [],
  });
  const [selectedForm, setSelectedForm] = useState<FormProps>({} as FormProps);
  const [positionSearch, setPositionSearch] = useState("");
  const [activeSplitPositionIndex, setActiveSplitPositionIndex] =
    useState<number>();
  const [splitPositionSearch, setSplitPositionSearch] = useState<string[]>([]);
  const [showPositionDropdown, setShowPositionDropdown] = useState<boolean>();

  const [showSplitPositionDropdown, setShowSplitPositionDropdown] =
    useState<boolean>();

  const [errors, setErrors] = useState<FormErrors>({});

  const { getFormById } = useForm();

  const { mutateAsync: fetchPositions } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/positions/get-positions`, body, true),
    onSuccess: (data) => {
      setPositionData(data);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  useEffect(() => {
    if (
      positionSearch ||
      (formData.hasSplitAssignee && activeSplitPositionIndex !== undefined)
    ) {
      fetchPositions({
        filters: [
          {
            key: "organizationId",
            value: user?.organizationId,
            condition: "equal",
          },
          {
            key: "title",
            value:
              formData.hasSplitAssignee &&
              activeSplitPositionIndex !== undefined
                ? splitPositionSearch[activeSplitPositionIndex]
                : positionSearch,
            condition: "like",
          },
        ],
        limit: 50,
        offset: 0,
      });
    } else {
      fetchPositions({
        filters: [
          {
            key: "organizationId",
            value: user?.organizationId || "",
            condition: "equal",
          },
        ],
        limit: 50,
        offset: 0,
      });
    }
  }, [positionSearch, splitPositionSearch]);

  useEffect(() => {
    if (formId) {
      setSelectedForm(getFormById(Number(formId)));
    }
  }, [formId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setStageData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveStage = () => {
    onSubmit(selectedStageIndex, formData);
    setIsOpenStageModal(false);
    setStageData({ ...emptyStageData });
  };

  const handleParentPositionSelect = (position: Position) => {
    setStageData((prev) => ({
      ...prev,
      assigneePositionId: position.id?.toString() || "",
    }));
    setPositionSearch(`${position.title}`);
    setShowPositionDropdown(false);
    if (errors.position) {
      setErrors((prev) => ({ ...prev, position: undefined }));
    }
  };

  const handleSplitPositionSelect = (
    index: number,
    position: Position,
    responseType: String
  ) => {
    setStageData((prevData: any) => {
      const splitPositions = [...(prevData.splitPositions || [])];
      splitPositions[index] = {
        ...(splitPositions[index] || {}),
        id: position.id,
        title: position.title,
        responseType,
      };
      return {
        ...prevData,
        splitPositions,
      };
    });

    let splitPositionSearchHolder = [...splitPositionSearch];
    splitPositionSearchHolder[index] = position.title;

    setSplitPositionSearch(splitPositionSearchHolder);
    setShowSplitPositionDropdown(false);
    setActiveSplitPositionIndex(undefined);
  };

  const handleSplitPositionSearch = (index: number, search: string) => {
    setSplitPositionSearch((prev) => {
      const next = [...prev];
      next[index] = search;
      return next;
    });
  };

  console.log(
    "----formDataStages--=====----",
    formDataStages?.length && formDataStages?.length
  );

  return (
    <div className="">
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedStage?.id ? "Edit" : "Create"} Stage
              </h1>
              <p className="text-gray-600">Modify form stage and settings.</p>
            </div>
          </div>

          <div className="mb-8 pb-6 border-gray-200">
            <div className="space-y-4">
              <div>
                <h3 className="text-l font-semibold text-gray-900">
                  Stage Title
                </h3>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <h3 className="text-l font-semibold text-gray-900">
                  Instruction
                </h3>
                <textarea
                  id="instruction"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isSubStage}
                    onChange={(e) =>
                      setStageData((prev) => ({
                        ...prev,
                        isSubStage: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Sub stage</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isResubmissionStage}
                    onChange={(e) =>
                      setStageData((prev) => ({
                        ...prev,
                        isResubmission: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Mark for resubmission
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPriorityComment}
                    onChange={(e) =>
                      setStageData((prev) => ({
                        ...prev,
                        isPriorityComment: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Priotize comment
                  </span>
                </label>
              </div>

              <h3 className="text-l font-semibold text-gray-900">
                Response Type
              </h3>
              <div className="border border-gray-300 mt-2 p-4 rounded-lg bg-white">
                <div className="flex gap-4">
                  {[
                    "Reject",
                    "Approval",
                    "Acknowledgement",
                    "Payment",
                    "Procurement",
                    "Recommend",
                  ].map((responseType) => (
                    <div className="mt-3 flex items-center" key={responseType}>
                      <input
                        type="checkbox"
                        id={`responseType-${responseType}`}
                        checked={(formData.responseTypes ?? []).includes(
                          responseType
                        )}
                        onChange={(e) =>
                          setStageData((prev) => ({
                            ...prev,
                            responseTypes: e.target.checked
                              ? [...(prev.responseTypes ?? []), responseType]
                              : (prev.responseTypes ?? []).filter(
                                  (type) => type !== responseType
                                ),
                          }))
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`responseType-${responseType}`}
                        className="text-sm text-gray-700"
                      >
                        {responseType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-l font-semibold text-gray-900">Assignee</h3>
                <>
                  <div className="border border-gray-300 p-4 rounded-lg bg-white">
                    <div className="flex gap-4 ">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="assignee"
                          checked={formData.isRequestor}
                          onChange={(e) =>
                            setStageData((prev) => ({
                              ...prev,
                              isRequestor: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor="assignToRequestor"
                          className="text-sm text-gray-700"
                        >
                          Requestor
                        </label>
                      </div>

                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="isRequestorParent"
                          checked={formData.isRequestorParent}
                          onChange={(e) =>
                            setStageData((prev) => ({
                              ...prev,
                              isRequestorParent: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor="assignToRequestor"
                          className="text-sm text-gray-700"
                        >
                          Head/Supervisor
                        </label>
                      </div>

                      {formDataStages?.length !== 0 && (
                        <div>
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id="assignee"
                              checked={formData.hasSplitAssignee}
                              onChange={(e) => {
                                setStageData((prev) => ({
                                  ...prev,
                                  hasSplitAssignee: e.target.checked,
                                }));
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor="hasSplitAssignee"
                              className="text-sm text-gray-700"
                            >
                              Split assignees
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {!formData.hasSplitAssignee ? (
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignee Position
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={positionSearch}
                              onChange={(e) => {
                                setPositionSearch(e.target.value);
                                setShowPositionDropdown(true);
                              }}
                              onFocus={() => setShowPositionDropdown(true)}
                              placeholder="Search and select employee"
                              className={`w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                                errors.position
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                            />
                            <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

                            {showPositionDropdown && positionSearch && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {positionData?.rows?.length &&
                                positionData?.rows?.length > 0 ? (
                                  positionData?.rows?.map((position) => (
                                    <div
                                      key={position.id}
                                      onClick={() =>
                                        handleParentPositionSelect(position)
                                      }
                                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-medium text-gray-900">
                                        {position.title}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {position.department?.name}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-gray-500">
                                    No position found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Assignee Holder Selection */}
                        <div className="flex-1">
                          <label className="block text-gray-700 text-sm mb-2">
                            Select assignee lookup field
                          </label>
                          <select
                            name="assigineeLookupField"
                            id="assigineeLookupField"
                            value={formData?.assigineeLookupField}
                            onChange={(e) =>
                              setStageData((prev) => ({
                                ...prev,
                                assigineeLookupField: e.target.value,
                              }))
                            }
                            required
                            className=" w-full py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select an option</option>
                            {selectedForm?.assigneeHolders &&
                              Object.entries(selectedForm.assigneeHolders).map(
                                ([key, value]) => (
                                  <option key={key} value={key}>
                                    {value}
                                  </option>
                                )
                              )}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Split Approval(s)
                        </label>
                        {/* This has to be previous reponseTypes */}
                        {formDataStages?.[
                          formDataStages.length - 1
                        ]?.responseTypes?.map((responseType, index) => {
                          if (responseType !== "Reject") {
                            return (
                              <div
                                key={responseType}
                                className="grid grid-cols-3 sm:flex-row gap-6"
                              >
                                {/* Position Selection */}
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {responseType}
                                </label>

                                <div className="relative col-span-2 mb-4">
                                  <input
                                    type="text"
                                    value={splitPositionSearch[index]}
                                    onChange={(e) => {
                                      setActiveSplitPositionIndex(index);
                                      handleSplitPositionSearch(
                                        index,
                                        e.target.value
                                      );
                                      setShowSplitPositionDropdown(true);
                                    }}
                                    onFocus={() =>
                                      setShowSplitPositionDropdown(true)
                                    }
                                    placeholder="Search and select employee"
                                    className={`w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                                      errors.position
                                        ? "border-red-300"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

                                  {showSplitPositionDropdown &&
                                    activeSplitPositionIndex === index && (
                                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {positionData?.rows?.length &&
                                        positionData?.rows?.length > 0 ? (
                                          positionData?.rows?.map(
                                            (position) => (
                                              <div
                                                key={position.id}
                                                onClick={() =>
                                                  handleSplitPositionSelect(
                                                    index,
                                                    position,
                                                    responseType
                                                  )
                                                }
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                              >
                                                <div className="font-medium text-gray-900">
                                                  {position.title}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                  {position.department?.name}
                                                </div>
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div className="px-4 py-3 text-gray-500">
                                            No position found
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>

                  <h3 className="text-l mt-2 font-semibold text-gray-900">
                    Voucher and Votebook Trigger
                  </h3>
                  <div className="border border-gray-300  p-4 rounded-lg bg-white">
                    <div className="flex gap-4">
                      {[
                        {
                          key: "triggerVoucherCreation",
                          label: "Trigger Voucher Creation",
                        },
                        {
                          key: "triggerVotebookEntry",
                          label: "Trigger Votebook Entry",
                        },
                      ].map(({ key, label }) => (
                        <div className="mt-3 flex items-center" key={key}>
                          <input
                            type="checkbox"
                            id={`responseType-${key}`}
                            checked={formData[key as keyof WorkFlowStage]}
                            onChange={(e) =>
                              setStageData((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`responseType-${key}`}
                            className="text-sm text-gray-700"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              </div>

              <div className="mt-6">
                <h3 className="text-l font-semibold text-gray-900">
                  Vissible sections
                </h3>
                <div className="w-full">
                  <select
                    multiple
                    value={formData.formSections || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (option) => option.value
                      );
                      setStageData({
                        ...formData,
                        formSections: selected,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                    style={{ minHeight: "100px" }}
                  >
                    {selectedForm?.formSections &&
                      Object.entries(selectedForm.formSections).map(
                        ([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        )
                      )}
                  </select>
                  <div className="mt-2 text-xs text-gray-500">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple fields.
                  </div>
                </div>

                {formData?.formSections &&
                  formData?.formSections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData?.formSections?.map((labelKey: string) => (
                        <span
                          key={labelKey}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {selectedForm?.formSections?.[labelKey] || labelKey}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              <div className="mt-6">
                <h3 className="text-l font-semibold text-gray-900">
                  Form fields
                </h3>
                <select
                  multiple
                  value={formData.formFields || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (option) => option.value
                    );
                    setStageData({
                      ...formData,
                      formFields: selected,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                  style={{ minHeight: "100px" }}
                >
                  {selectedForm?.inputLabels &&
                    Object.entries(selectedForm.inputLabels).map(
                      ([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      )
                    )}
                </select>
                <div className="mt-2 text-xs text-gray-500">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple fields.
                </div>

                {formData.formFields && formData.formFields.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.formFields.map((labelKey: string) => (
                      <span
                        key={labelKey}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {selectedForm?.inputLabels?.[labelKey] || labelKey}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-6">
          <div onClick={() => setIsOpenStageModal(false)} className="">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer">
              Cancel
            </button>
          </div>
          <div className="ml-4">
            <button
              onClick={handleSaveStage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
