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

export type FormSchema = SectionDef[];
