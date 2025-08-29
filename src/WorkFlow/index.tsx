"use client";

import CreateWorkflowButton from "./CreateWorkflowButton";
import WorkflowListing from "./WorkflowListing";

export default function Workflow() {
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
