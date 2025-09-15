//Stub para navegar desde el calendario
import { useParams } from "react-router-dom";


export default function EventPage() {
const { id } = useParams();
return (
<div>
<h2 className="text-2xl font-semibold">Evento #{id}</h2>
<p className="text-sm text-gray-500">TODO: detalle del evento.</p>
</div>
);
}