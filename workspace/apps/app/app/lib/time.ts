export const nowIso = () => new Date().toISOString();
export const addDaysIso = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
export const addMinutesIso = (m: number) => new Date(Date.now() + m * 60000).toISOString();
