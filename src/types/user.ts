/**
 * User & Sleep Data Types
 */

export interface UserProfile {
  id?: string;
  age: string;
  gender: string;
  bedTime: string; // HH:MM
  wakeTime: string; // HH:MM
  sleepQuality: string; // 1-10 scale or "low" | "medium" | "high"
  stressLevel: string; // 1-10 scale or "low" | "medium" | "high"
  // Phone usage behavior (replaces screenTimePerDay)
  phoneUsageEndTime: string; // "before_22h" | "until_23h" | "until_00h" | "after_00h"
  phoneInBed: string; // "never" | "sometimes" | "always"
  sleepConsistency: string; // "regular" | "slight_variation" | "high_variation"
  wakeRestfulness: string; // "always" | "sometimes" | "never"
  fallAsleepDuration: string; // "less_15min" | "15_30min" | "30_60min" | "more_60min"
  // Location
  homeZipCode?: string; // CEP da residência (ex: 12345678)
  homeAddress?: string; // Endereço legível (ex: "Rua X, 123, São Paulo, SP")
  homeLatitude?: number; // Latitude da residência (internal)
  homeLongitude?: number; // Longitude da residência (internal)
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
  notificationModalVisible: boolean;
  currentNotificationType: 'bed_reminder' | 'wake_reminder' | null;
  
  // Actions
  setOnboarded: (value: boolean) => Promise<void>;
  updateUserData: (data: UserProfile) => Promise<void>;
  addSleepLog: (log: SleepLog) => Promise<void>;
  updateSleepLog: (id: string, log: Partial<SleepLog>) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  loadUserData: () => Promise<void>;
  getPersistedAppData: () => Promise<{
    isOnboarded: boolean;
    userData: UserProfile | null;
    sleepLogs: SleepLog[];
    syncQueue: SleepLog[];
    globalQualityAverage: number;
  }>;
  loadGlobalMetrics: () => Promise<void>;
  userQualityStats: () => SleepQualityMetrics;
  clearAllData: () => Promise<void>;
  showNotificationModal: (type: 'bed_reminder' | 'wake_reminder') => void;
  closeNotificationModal: () => void;
}

export interface DeviceData {
  screenTime?: number; // minutos
  batteryLevel?: number; // 0-100
  isCharging?: boolean;
  deviceModel?: string;
  osVersion?: string;
}

export interface PermissionStatus {
  notifications: 'granted' | 'denied' | 'unknown';
  microphone: 'granted' | 'denied' | 'unknown';
}
