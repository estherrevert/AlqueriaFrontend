import type { DaysGateway } from "@/domain/days/ports";

export function makeDaysUseCases(gateway: DaysGateway) {
  return {
    getOrCreate: (dateISO: string) => gateway.getOrCreate(dateISO),
  };
}
