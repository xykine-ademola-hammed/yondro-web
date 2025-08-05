import { RequestDetailProvider } from "./RequestDetailContext";

export default function RequestDetail() {
  return (
    <RequestDetailProvider>
      <RequestDetailOverview />
    </RequestDetailProvider>
  );
}
