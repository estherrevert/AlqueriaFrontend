import React, { useRef } from "react";

type Props = {
  label: string;
  accept?: string;
  onFile: (file: File) => void | Promise<void>;
  disabled?: boolean;
};

export default function UploadButton({ label, accept = "application/pdf", onFile, disabled }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const pick = () => ref.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFile(file);
    if (ref.current) ref.current.value = "";
  };

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={pick}
        disabled={disabled}
        className="
          inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm
          bg-white border-[var(--color-beige)] text-[var(--color-text-main)]
          hover:bg-[var(--color-alt-bg)]
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]
        "
      >
        {label}
      </button>
    </>
  );
}
