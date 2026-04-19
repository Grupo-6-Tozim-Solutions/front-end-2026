import { UserProfile, SleepLog } from '../types/user';

const BASE_URL = 'http://localhost:8000';
const API_TIMEOUT = 10000; // 10 segundos

/**
 * @deprecated Use submitOnboarding() in AppContext instead
 */
export interface QuestionnaireData {
    age: number;
    gender: string;
    screenTime: number;
    bedTime: string;
    wakeTime: string;
    sleepQuality: number;
    stressLevel: number;
}

/**
 * Helper para fazer requisições com timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * Submits onboarding data (user profile) to the backend API
 * TODO: Enable when backend is ready
 */
export const submitOnboarding = async (
    data: UserProfile
): Promise<{ success: boolean; message: string; userId?: string }> => {
    // API calls disabled for now - backend integration pending
    return {
        success: true,
        message: 'Onboarding saved locally',
        userId: `user_${Date.now()}`, // Mock ID
    };
    
    // Uncomment below when backend is ready:
    /*
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/onboarding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            message: result.message || 'Onboarding submitted successfully',
            userId: result.userId,
        };
    } catch (error) {
        console.error('[API] Onboarding Error:', error);
        throw error; // Re-throw para o AppContext lidar com retry
    }
    */
};

/**
 * Submits sleep log to the backend API
 * TODO: Enable when backend is ready
 */
export const submitSleepLog = async (
    log: SleepLog
): Promise<{ success: boolean; message: string; logId?: string }> => {
    // API calls disabled for now - backend integration pending
    return {
        success: true,
        message: 'Sleep log saved locally',
        logId: log.id,
    };
    
    // Uncomment below when backend is ready:
    /*
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/sleep-logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(log),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            message: result.message || 'Sleep log submitted successfully',
            logId: result.logId || log.id,
        };
    } catch (error) {
        console.error('[API] Sleep Log Error:', error);
        throw error; // Re-throw para retry
    }
    */
};

/**
 * Updates an existing sleep log
 * TODO: Enable when backend is ready
 */
export const updateSleepLog = async (
    logId: string,
    data: Partial<SleepLog>
): Promise<{ success: boolean; message: string }> => {
    // API calls disabled for now - backend integration pending
    return {
        success: true,
        message: 'Sleep log updated locally',
    };
    
    // Uncomment below when backend is ready:
    /*
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/sleep-logs/${logId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            message: result.message || 'Sleep log updated successfully',
        };
    } catch (error) {
        console.error('[API] Update Sleep Log Error:', error);
        throw error;
    }
    */
};

/**
 * Gets sync queue status (what's pending)
 * TODO: Enable when backend is ready
 */
export const getSyncQueue = async (): Promise<SleepLog[]> => {
    // API calls disabled for now - backend integration pending
    return [];
    
    // Uncomment below when backend is ready:
    /*
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/sync-queue`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        return result.queue || [];
    } catch (error) {
        console.error('[API] Get Sync Queue Error:', error);
        return [];
    }
    */
};

/**
 * @deprecated Use submitOnboarding() instead
 * Submits questionnaire data to the backend API.
 * TODO: Enable when backend is ready
 */
export const submitQuestionnaire = async (
    data: QuestionnaireData
): Promise<{ success: boolean; message: string }> => {
    // API calls disabled for now - backend integration pending
    return {
        success: true,
        message: 'Data saved locally',
    };
    
    // Uncomment below when backend is ready:
    /*
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/questionnaire`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, message: result.message || 'Data submitted successfully' };
    } catch (error) {
        console.error('[API] Questionnaire Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
    */
};

/**
 * Gets global sleep quality average (benchmark)
 * Returns default 7.2 if backend unavailable (offline fallback)
 * TODO: Enable when backend is ready
 */
export const getGlobalSleepQualityAverage = async (): Promise<number> => {
    // API calls disabled for now - backend integration pending
    // Using benchmark fallback value
    return 7.2;
    
    // Uncomment below when backend is ready:
    /*
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/sleep-quality/global-average`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn(`[API] Failed to fetch global average: ${response.status}`);
            return 7.2; // Fallback to default
        }

        const result = await response.json();
        return result.average || 7.2;
    } catch (error) {
        console.error('[API] Get Global Sleep Quality Average Error:', error);
        return 7.2; // Offline fallback
    }
    */
};
