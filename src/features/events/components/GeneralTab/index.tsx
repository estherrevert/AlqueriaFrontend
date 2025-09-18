import React from "react";
import DetailPanel from "./DetailPanel";

export default function GeneralTab({ eventId }: { eventId: number }) {
  return (
    <div className="space-y-4">
      <DetailPanel eventId={eventId} />
      {/* En el futuro aquí puedes añadir ClientsDataPanel, etc. */}
    </div>
  );
}
