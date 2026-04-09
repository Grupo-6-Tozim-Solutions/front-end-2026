/**
 * User & Sleep Data Types
 */

export interface UserProfile {
  id?: string;
  age: string;
  gender: string;
  screenTimePerDay: string; // horas por dia
  bedTime: string; // HH:MM
  wakeTime: string; // HH:MM
  sleepQuality: string; // 1-10 scale or "low" | "medium" | "high"
  stressLevel: string; // 1-10 scale or "low" | "medium" | "high"
  createdAt?: string;
  updatedAt?: string;
}

export interface SleepLog {
  id?: string;
  date: string; // YYYY-MM-DD
  hoursSlept: string; // número de horas
  bedTimeActual?: string; // HH:MM quando foi dormir
  wakeTimeActual?: string; // HH:MM quando acordou
  notes?: string;
  quality?: string; // 1-10 or low/medium/high
  timestamp: number; // milliseconds para ordenação
  syncStatus?: 'pending' | 'synced' | 'failed'; // status offline-first
}

export interface SleepQualityMetrics {
  averageQuality: number; // 0-10 average of selected period
  totalLogsInPeriod: number; // number of sleep logs
  trend: 'improving' | 'declining' | 'stable'; // trend direction
  currentStreak: number; // consecutive days with quality >= threshold
  globalAverage: number; // global benchmark (default 7.2)
  percentile: number; // where user ranks vs global (0-100)
  qualityCategory: 'poor' | 'fair' | 'good' | 'excellent'; // quality classification
  lastUpdated: string; // ISO timestamp
}

export interface AppContextType {
  // State
  isOnboarded: boolean;
  userData: UserProfile | null;
  sleepLogs: SleepLog[];
  isLoading: boolean;
  syncQueue: SleepLog[]; // fila de logs pendentes de envio
  globalQualityAverage: number; // global benchmark (e.g., 7.2)
  
  // Actions
  setOnboarded: (value: boolean) => Promise<void>;
  updateUserData: (data: UserProfile) => Promise<void>;
  addSleepLog: (log: SleepLog) => Promise<void>;
  updateSleepLog: (id: string, log: Partial<SleepLog>) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  loadUserData: () => Promise<void>;
  loadGlobalMetrics: () => Promise<void>;
  userQualityStats: () => SleepQualityMetrics;
  clearAllData: () => Promise<void>;
}

export interface DeviceData {
  screenTime?: number; // minutos
  batteryLevel?: number; // 0-100
  isCharging?: boolean;
  deviceModel?: string;
  osVersion?: string;
}

export interface PermissionStatus {
  screenTime: 'granted' | 'denied' | 'unknown';
  sensors: 'granted' | 'denied' | 'unknown';
  healthData?: 'granted' | 'denied' | 'unknown';
}
