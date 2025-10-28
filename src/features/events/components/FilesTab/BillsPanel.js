import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { makeFilesUseCases } from "@/application/files/usecases";
import { FilesHttpGateway } from "@/infrastructure/http/files.gateway";
import FileListPanel from "@/shared/ui/files/FileListPanel";
const uc = makeFilesUseCases(FilesHttpGateway);
export default function BillsPanel({ eventId }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bills, setBills] = useState([]);
    const load = async () => {
        setLoading(true);
        try {
            const list = await uc.listBills(eventId);
            setBills(list);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [eventId]);
    const onUpload = async (file) => {
        setSaving(true);
        try {
            const b = await uc.uploadBill(eventId, file);
            setBills((prev) => [b, ...prev]);
            return b;
        }
        finally {
            setSaving(false);
        }
    };
    const onDelete = async (id) => {
        setSaving(true);
        try {
            await uc.deleteBill(id);
            setBills((prev) => prev.filter((b) => b.id !== id));
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx(FileListPanel, { title: "Facturas", items: bills, onUpload: onUpload, onDelete: onDelete, uploading: saving, loading: loading, emptyText: "A\u00FAn no hay facturas subidas." }));
}
