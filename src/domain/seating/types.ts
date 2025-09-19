export type SeatingTable = {
  id: number;
  is_main_table: boolean;
  table_number: string | null;
  adults: number;
  children: number;
  staff: number;
  no_menu: number;
  notes: string | null;
};

export type SeatingTotals = {
  adults: number;
  children: number;
  staff: number;
  no_menu: number;
  total: number;
};

export type SeatingIndexDTO = {
  tables: SeatingTable[];
  totals: SeatingTotals;
  pdf_url: string | null;
};
