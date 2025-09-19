export type FileDTOBase = {
  id: number;
  url: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContractDTO = FileDTOBase;
export type BillDTO = FileDTOBase;
