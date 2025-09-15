import type { DaysGateway } from '@/domain/days/ports';


export function makeDaysUseCases(gw: DaysGateway) {
return {
getOrCreateByDate: (dateISO: string) => gw.getOrCreateByDate(dateISO),
};
}