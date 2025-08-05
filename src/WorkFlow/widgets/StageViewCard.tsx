import React from "react";
import type { StageData } from "../../common/types";

const StageViewCard: React.FC<StageData> = ({
  name,
  assignee,
  assignToRequestor,
  assignToRequestorDepartment,
}) => {
  return (
    <div className="">
      <h2 className="font-semibold text-gray-800 mb-1">{name}</h2>
      <div className="mb-4">
        <h3 className="font-medium text-gray-700">Assignee: </h3>

        <p className="text-gray-600 ml-4">
          {assignToRequestor && "Requestor"}
          {assignToRequestorDepartment && "Requestor Department -"}
          {assignee?.departmentName && assignee?.departmentName + " -"}{" "}
          {assignee?.positionName && assignee.positionName}
        </p>
      </div>
    </div>
  );
};

export default StageViewCard;
