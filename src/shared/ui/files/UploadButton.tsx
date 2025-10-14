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
        className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover"
      >
        {label}
      </button>
    </>
  );
}
