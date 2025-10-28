import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { makeEventSeatingUseCases } from "@/application/eventSeating/usecases";
import PdfActions from "@/features/shared/PdfActions";
import TableRow from "./TableRow";
const uc = makeEventSeatingUseCases();
async function pMap(items, mapper, concurrency = 4) {
    const ret = [];
    let idx = 0;
    const run = async () => {
        while (idx < items.length) {
            const i = idx++;
            ret[i] = await mapper(items[i]);
        }
    };
    const runners = Array.from({ length: Math.min(concurrency, items.length) }, run);
    await Promise.all(runners);
    return ret;
}
export default function TablesPanel({ eventId }) {
    const [data, setData] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [savingAll, setSavingAll] = useState(false);
    const [generating, setGenerating] = useState(false);
    const dirty = useRef(new Set());
    const markDirty = (id) => { dirty.current.add(id); };
    const clearDirty = (ids) => {
        if (!ids) {
            dirty.current.clear();
            return;
        }
        ids.forEach((id) => dirty.current.delete(id));
    };
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await uc.index(eventId);
                if (!mounted)
                    return;
                setData(res);
                setRows(res.tables);
                clearDirty();
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId]);
    // Detecta duplicados en tiempo real (ignora vacío / solo espacios)
    const { duplicates, duplicateNumbers } = useMemo(() => {
        const counts = new Map();
        const toKey = (val) => {
            if (val == null)
                return "";
            return (typeof val === "string" ? val : String(val)).trim();
        };
        for (const r of rows) {
            const key = toKey(r.table_number);
            if (!key)
                continue; // ignorar vacíos
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const dupIds = new Set();
        const nums = [];
        counts.forEach((cnt, key) => { if (cnt > 1)
            nums.push(key); });
        if (nums.length) {
            const dupKeys = new Set(nums);
            for (const r of rows) {
                const key = toKey(r.table_number);
                if (key && dupKeys.has(key))
                    dupIds.add(r.id);
            }
        }
        return { duplicates: dupIds, duplicateNumbers: nums };
    }, [rows]);
    const totals = useMemo(() => {
        const s = (k) => rows.reduce((acc, r) => acc + Number(r[k] ?? 0), 0);
        const adults = s("adults");
        const children = s("children");
        const staff = s("staff");
        const no_menu = s("no_menu");
        const total = adults + children + staff + no_menu;
        return { adults, children, staff, no_menu, total };
    }, [rows]);
    const dirtyCount = dirty.current.size;
    const onAdd = async () => {
        const created = await uc.addTable(eventId, {
            is_main_table: false, table_number: "", adults: 0, children: 0, staff: 0, no_menu: 0, notes: ""
        });
        setRows((prev) => [...prev, created]);
        setData((prev) => (prev ? { ...prev, tables: [...prev.tables, created] } : prev));
    };
    const patchRow = (id, patch) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
        dirty.current.add(id);
    };
    const deleteRow = (id) => async () => {
        await uc.removeTable(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
        setData((prev) => (prev ? { ...prev, tables: prev.tables.filter((r) => r.id !== id) } : prev));
        clearDirty([id]);
    };
    const saveAll = async () => {
        if (duplicates.size > 0) {
            setMessage(`Hay números de mesa duplicados: ${duplicateNumbers.join(", ")}`);
            setTimeout(() => setMessage(null), 3500);
            return;
        }
        const ids = Array.from(dirty.current);
        if (ids.length === 0)
            return;
        setSavingAll(true);
        try {
            const toSave = rows.filter((r) => ids.includes(r.id));
            await pMap(toSave, (r) => uc.updateTable(r.id, {
                is_main_table: r.is_main_table,
                table_number: r.table_number,
                adults: r.adults,
                children: r.children,
                staff: r.staff,
                no_menu: r.no_menu,
                notes: r.notes,
            }), 4);
            clearDirty(ids);
            setMessage("Todos los cambios guardados.");
        }
        catch (e) {
            setMessage(e?.message ?? "Error guardando algunos cambios.");
        }
        finally {
            setSavingAll(false);
            setTimeout(() => setMessage(null), 3500);
        }
    };
    const onGeneratePdf = async () => {
        if (duplicates.size > 0) {
            setMessage(`No se puede generar PDF con números duplicados: ${duplicateNumbers.join(", ")}`);
            setTimeout(() => setMessage(null), 3500);
            return;
        }
        if (dirty.current.size > 0) {
            await saveAll();
            if (dirty.current.size > 0)
                return; // si falló algo, paramos
        }
        setGenerating(true);
        try {
            const url = await uc.generatePdf(eventId);
            setData((prev) => (prev ? { ...prev, pdf_url: url } : prev));
            setMessage("PDF generado correctamente.");
        }
        catch {
            setMessage("Error al generar el PDF.");
        }
        finally {
            setGenerating(false);
            setTimeout(() => setMessage(null), 3500);
        }
    };
    if (loading) {
        return (_jsx("section", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm", children: _jsx("p", { children: "Cargando mesas\u2026" }) }));
    }
    return (_jsxs("section", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3", children: [_jsxs("header", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("div", { className: "flex items-center gap-3", children: _jsxs("h3", { className: "text-base font-semibold text-gray-800 flex items-center gap-2", children: ["MESAS", _jsxs("span", { className: "text-xs font-normal text-gray-500", children: ["Total asistentes: ", totals.total] })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: onAdd, className: "px-3 py-1.5 rounded-md text-sm bg-primary text-white hover:bg-primary-hover", children: "A\u00F1adir mesa" }), _jsx("button", { onClick: saveAll, className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover disabled:opacity-60", disabled: savingAll || dirtyCount === 0 || duplicates.size > 0, title: duplicates.size > 0 ? "Resuelve duplicados antes de guardar" : (dirtyCount === 0 ? "No hay cambios" : "Guardar todas las mesas"), children: savingAll ? "Guardando…" : "Guardar todo" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 text-gray-700", children: [_jsx("th", { className: "px-2 py-2 text-center w-24", children: "MP" }), _jsx("th", { className: "px-2 py-2", children: "Mesa" }), _jsx("th", { className: "px-2 py-2 text-right w-20", children: "Total" }), _jsx("th", { className: "px-2 py-2 text-right w-28", children: "Adultos" }), _jsx("th", { className: "px-2 py-2 text-right w-28", children: "Staff" }), _jsx("th", { className: "px-2 py-2 text-right w-28", children: "Ni\u00F1os" }), _jsx("th", { className: "px-2 py-2 text-right w-28", children: "Sin men\u00FA" }), _jsx("th", { className: "px-2 py-2", children: "Observaciones" }), _jsx("th", { className: "px-2 py-2 w-52" })] }) }), _jsx("tbody", { children: rows.map((r) => (_jsx(TableRow, { value: r, onChange: (patch) => patchRow(r.id, patch), onDelete: deleteRow(r.id), isDirty: dirty.current.has(r.id), duplicateNumber: duplicates.has(r.id) }, r.id))) }), _jsx("tfoot", { children: _jsxs("tr", { className: "bg-gray-50 font-semibold", children: [_jsx("td", { className: "px-2 py-2 text-right", colSpan: 2, children: "TOTAL" }), _jsx("td", { className: "px-2 py-2 text-right", children: totals.total }), _jsx("td", { className: "px-2 py-2 text-right", children: totals.adults }), _jsx("td", { className: "px-2 py-2 text-right", children: totals.staff }), _jsx("td", { className: "px-2 py-2 text-right", children: totals.children }), _jsx("td", { className: "px-2 py-2 text-right", children: totals.no_menu }), _jsx("td", { colSpan: 2 })] }) })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: onGeneratePdf, className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondarydisabled:opacity-60", disabled: generating || savingAll || duplicates.size > 0, title: duplicates.size > 0 ? "Resuelve duplicados antes de generar" : "Generar PDF", children: generating ? "Generando…" : "Generar PDF" }), _jsx(PdfActions, { url: data?.pdf_url ?? null })] }), message && (_jsx("div", { className: "text-sm", children: _jsx("span", { className: message.startsWith("Error") || message.startsWith("No se puede") ? "text-red-600" : "text-green-700", children: message }) }))] }));
}
