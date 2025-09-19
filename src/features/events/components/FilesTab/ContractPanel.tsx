import React, { useEffect, useState } from "react";
import { makeFilesUseCases } from "@/application/files/usecases";
import { FilesHttpGateway } from "@/infrastructure/http/files.gateway";
import type { ContractDTO } from "@/domain/files/types";
import FileListPanel, { FileItem } from "@/shared/ui/files/FileListPanel";

const uc = makeFilesUseCases(FilesHttpGateway);

export default function ContractPanel({ eventId }: { eventId: number }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contract, setContract] = useState<ContractDTO | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const c = await uc.getContract(eventId);
      setContract(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const onUpload = async (file: File): Promise<FileItem> => {
    setSaving(true);
    try {
      const res = await uc.uploadContract(eventId, file);
      setContract(res);
      return res;
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!contract) return;
    setSaving(true);
    try {
      await uc.deleteContract(id);
      setContract(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FileListPanel
      title="Contrato"
      items={contract ? [contract] : []}
      onUpload={onUpload}
      onDelete={onDelete}
      uploading={saving}
      loading={loading}
      emptyText="Aún no hay un contrato subido."
      single
    />
  );
}
