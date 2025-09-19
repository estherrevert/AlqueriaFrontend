import type { BillDTO, ContractDTO } from "./types";

export interface FilesGateway {
  // Contract
  getContract(eventId: number): Promise<ContractDTO | null>;
  uploadContract(eventId: number, file: File): Promise<ContractDTO>;
  deleteContract(contractId: number): Promise<void>;

  // Bills
  listBills(eventId: number): Promise<BillDTO[]>;
  uploadBill(eventId: number, file: File): Promise<BillDTO>;
  deleteBill(billId: number): Promise<void>;
}
