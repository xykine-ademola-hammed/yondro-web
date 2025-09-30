import RequestDetailContextProvider from "./RequestDetailContext";
import WorkflowDetail2 from "./RequestDetailView";

export default function RequestDetail() {
  return (
    <RequestDetailContextProvider>
      <WorkflowDetail2 />
    </RequestDetailContextProvider>
  );
}
