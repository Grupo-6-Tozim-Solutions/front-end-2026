const BASE_URL = 'http://localhost:8000';

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
 * Submits questionnaire data to the backend API.
 * Currently a stub — will be connected to FastAPI when the backend is ready.
 */
export const submitQuestionnaire = async (
    data: QuestionnaireData
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${BASE_URL}/api/questionnaire`, {
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
        console.error('API Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};
