import React from "react";
import RequestDetailView from "../../components/RequestDetailView";
import { useRequestDetailContext } from "../RequestDetailContext";

export default function RequestDetailOverview() {
  const { request } = useRequestDetailContext();

  return (
    <>
      <RequestDetailView
        onClose={}
        request={request}
        onApprove={}
        onReject={}
      />
    </>
  );
}
