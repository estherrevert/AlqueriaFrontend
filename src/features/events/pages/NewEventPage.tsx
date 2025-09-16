import { useNavigate, useSearchParams } from "react-router-dom";
import EventForm from "../components/EventForm";

export default function NewEventPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialDate = params.get("date") ?? undefined; // ISO YYYY-MM-DD

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nuevo evento</h1>
        <button onClick={() => navigate(-1)} className="text-sm underline">Volver</button>
      </div>
      <EventForm initialDate={initialDate} />
    </div>
  );
}