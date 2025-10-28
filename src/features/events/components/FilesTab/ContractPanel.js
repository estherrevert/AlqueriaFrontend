import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { makeFilesUseCases } from "@/application/files/usecases";
import { FilesHttpGateway } from "@/infrastructure/http/files.gateway";
import FileListPanel from "@/shared/ui/files/FileListPanel";
const uc = makeFilesUseCases(FilesHttpGateway);
export default function ContractPanel({ eventId }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contract, setContract] = useState(null);
    const load = async () => {
        setLoading(true);
        try {
            const c = await uc.getContract(eventId);
            setContract(c);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [eventId]);
    const onUpload = async (file) => {
        setSaving(true);
        try {
            const res = await uc.uploadContract(eventId, file);
            setContract(res);
            return res;
        }
        finally {
            setSaving(false);
        }
    };
    const onDelete = async (id) => {
        if (!contract)
            return;
        setSaving(true);
        try {
            await uc.deleteContract(id);
            setContract(null);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx(FileListPanel, { title: "Contrato", items: contract ? [contract] : [], onUpload: onUpload, onDelete: onDelete, uploading: saving, loading: loading, emptyText: "A\u00FAn no hay un contrato subido.", single: true }));
}
