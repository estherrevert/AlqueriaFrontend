export function makeEventsUseCases(gateway) {
    return {
        list: (params) => gateway.list(params),
        get: (id) => gateway.get(id),
        create: (input) => gateway.create(input),
        changeStatus: (id, status) => gateway.changeStatus(id, status),
        update: (id, payload) => gateway.update(id, payload),
        updateDate: (eventId, dateISO) => gateway.updateDate(eventId, dateISO),
        setUsers: async (eventId, current, next) => {
            const cur = new Set(current ?? []);
            const nxt = new Set(next ?? []);
            const toAttach = [];
            const toDetach = [];
            nxt.forEach(id => { if (!cur.has(id))
                toAttach.push(id); });
            cur.forEach(id => { if (!nxt.has(id))
                toDetach.push(id); });
            if (toAttach.length)
                await gateway.attachUsers(eventId, toAttach);
            for (const id of toDetach)
                await gateway.detachUser(eventId, id);
        },
    };
}
