export function makeFilesUseCases(gateway) {
    return {
        // Contract
        getContract: (eventId) => gateway.getContract(eventId),
        uploadContract: (eventId, file) => gateway.uploadContract(eventId, file),
        deleteContract: (contractId) => gateway.deleteContract(contractId),
        // Bills
        listBills: (eventId) => gateway.listBills(eventId),
        uploadBill: (eventId, file) => gateway.uploadBill(eventId, file),
        deleteBill: (billId) => gateway.deleteBill(billId),
    };
}
