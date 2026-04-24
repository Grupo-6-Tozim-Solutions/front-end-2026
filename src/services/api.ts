import { UserProfile, SleepLog } from '../types/user';
import api from './client';

const SHOW_LOG_PREFIX = process.env.EXPO_PUBLIC_SHOW_LOG_PREFIX !== 'false';

/**
 * Helper para criar prefixo de log
 * @param service - Nome do serviço
 * @returns Prefixo formatado ou string vazia conforme EXPO_PUBLIC_SHOW_LOG_PREFIX
 */
const logPrefix = (service: string): string => {
    return SHOW_LOG_PREFIX ? `[${service}] ` : '';
};

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
 * Gets global sleep median (mediana de sono da população)
 * Fetches from backend endpoint: GET /mediana-sono
 * Returns 0 if backend unavailable (offline fallback)
 */
export const getGlobalSleepQualityAverage = async (): Promise<number> => {
    try {
        console.log(`${logPrefix('API')}Fetching global sleep median from /mediana-sono...`);
        
        const response = await api.get('/sleep-kpi/mediana-sono');
        
        const mediana = response.data?.sono_mediano_populacao || 0;

        console.log(`${logPrefix('API')}Global sleep median fetched successfully: ${mediana}`);
        return mediana;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`${logPrefix('API')}Error fetching global sleep median:`, errorMessage);
        console.log(`${logPrefix('API')}Using fallback value: 0`);
        return 0;
    }
};
