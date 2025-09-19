import React, { useEffect, useState } from "react";
import { makeFilesUseCases } from "@/application/files/usecases";
import { FilesHttpGateway } from "@/infrastructure/http/files.gateway";
import type { BillDTO } from "@/domain/files/types";
import FileListPanel, { FileItem } from "@/shared/ui/files/FileListPanel";

const uc = makeFilesUseCases(FilesHttpGateway);

export default function BillsPanel({ eventId }: { eventId: number }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bills, setBills] = useState<BillDTO[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const list = await uc.listBills(eventId);
      setBills(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const onUpload = async (file: File): Promise<FileItem> => {
    setSaving(true);
    try {
      const b = await uc.uploadBill(eventId, file);
      setBills((prev) => [b, ...prev]);
      return b;
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    setSaving(true);
    try {
      await uc.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FileListPanel
      title="Facturas"
      items={bills}
      onUpload={onUpload}
      onDelete={onDelete}
      uploading={saving}
      loading={loading}
      emptyText="Aún no hay facturas subidas."
    />
  );
}
