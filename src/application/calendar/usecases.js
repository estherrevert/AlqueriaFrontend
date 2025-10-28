export function makeGetDaysUseCase(gateway) {
    return async function getDays(params) {
        return gateway.getDays(params);
    };
}
