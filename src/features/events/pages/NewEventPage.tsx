import { useNavigate } from "react-router-dom";
// Si usas react-query aquí, déjalo, pero no hace falta para esta page simple
import EventForm from "../components/EventForm";

export default function NewEventPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nuevo evento</h1>
        <button onClick={() => navigate(-1)} className="text-sm underline">Volver</button>
      </div>
      <EventForm />
    </div>
  );
}
