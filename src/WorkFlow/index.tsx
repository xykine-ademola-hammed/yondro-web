"use client";

import { useState } from "react";
import AddEditWorkflowModal from "./AddEditWorkflowModal";
import { Link } from "react-router-dom";
import CreateWorkflowButton from "./CreateWorkflowButton";
import WorkflowListing from "./WorkflowListing";
import { useOrganization } from "../GlobalContexts/Organization-Context";

interface AssigneePosition {
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  positionHolderName: string;
  positionHolderId: string;
}

interface WorkFlow {
  id: number;
  name: string;
  description: string;
  status: string;
  steps: number;
  assignees: AssigneePosition[];
  lastModified: string;
  completedTasks: number;
  pendingTasks: number;
}

export default function Workflow() {
  const [editingWorkflow, setEditingWorkflow] = useState<WorkFlow | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflows</h1>
            <p className="text-gray-600">Create and manage workflows.</p>
          </div>
          <CreateWorkflowButton />
        </div>

        <WorkflowListing />
      </div>
    </main>
  );
}
