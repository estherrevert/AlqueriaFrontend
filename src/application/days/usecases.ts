import { DaysHttpGateway } from "@/infrastructure/http/days.gateway";

export function makeDaysUseCases(gw = DaysHttpGateway) {
  return {
    getOrCreate: (date: string) => gw.getOrCreate(date),
    getRange: (from: string, to: string) => gw.listRange({ from, to }),
    getByDate: (date: string) => gw.getByDate(date),
  };
}
