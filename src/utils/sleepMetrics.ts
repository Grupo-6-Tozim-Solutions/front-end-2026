import { SleepLog } from '../types/user';

export const parseHoursSlept = (hoursSlept?: string): number => {
  const hours = Number.parseFloat(hoursSlept ?? '');
  return Number.isFinite(hours) && hours > 0 ? hours : 0;
};

export const hasRecordedSleep = (log?: SleepLog | null): log is SleepLog => {
  return !!log && parseHoursSlept(log.hoursSlept) > 0;
};

export const filterLogsWithRecordedSleep = (logs: SleepLog[]): SleepLog[] => {
  return logs.filter(hasRecordedSleep);
};

export const calculateAverageHours = (logs: SleepLog[]): number => {
  const sleepingLogs = filterLogsWithRecordedSleep(logs);
  if (!sleepingLogs.length) return 0;

  const total = sleepingLogs.reduce((sum, log) => sum + parseHoursSlept(log.hoursSlept), 0);
  return total / sleepingLogs.length;
};

export const parseSleepQuality = (quality?: string): number => {
  if (!quality) return 0;

  const parsedQuality = Number.parseInt(quality, 10);
  if (Number.isNaN(parsedQuality)) return 0;

  return Math.min(10, Math.max(0, parsedQuality));
};
