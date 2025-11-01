import { api } from "@/shared/api/client";

export type FieldType =
  | "text"
  | "textarea"
  | "time"
  | "date"
  | "number"
  | "phone"
  | "select"
  | "checkbox";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  colSpan?: 1 | 2;
  required?: boolean;
};

export type SectionDef = {
  key: string;
  title: string;
  icon?: string;
  fields: FieldDef[];
};
export type FormSchema = { version: number; sections: SectionDef[] };

export async function fetchDetailSchema(): Promise<FormSchema> {
  const res = await api.get("/api/v1/events/detail/schema", {
    withCredentials: true,
  });
  return res.data as FormSchema;
}
