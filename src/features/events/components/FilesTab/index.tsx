import React from "react";
import ContractPanel from "./ContractPanel";
import BillsPanel from "./BillsPanel";

export default function FilesTab({ eventId }: { eventId: number }) {
  return (
    <div className="space-y-4">
      <ContractPanel eventId={eventId} />
      <BillsPanel eventId={eventId} />
    </div>
  );
}
