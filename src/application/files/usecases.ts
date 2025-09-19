import type { FilesGateway } from "@/domain/files/ports";
import type { BillDTO, ContractDTO } from "@/domain/files/types";

export function makeFilesUseCases(gateway: FilesGateway) {
  return {
    // Contract
    getContract: (eventId: number): Promise<ContractDTO | null> => gateway.getContract(eventId),
    uploadContract: (eventId: number, file: File): Promise<ContractDTO> =>
      gateway.uploadContract(eventId, file),
    deleteContract: (contractId: number): Promise<void> => gateway.deleteContract(contractId),

    // Bills
    listBills: (eventId: number): Promise<BillDTO[]> => gateway.listBills(eventId),
    uploadBill: (eventId: number, file: File): Promise<BillDTO> => gateway.uploadBill(eventId, file),
    deleteBill: (billId: number): Promise<void> => gateway.deleteBill(billId),
  };
}
