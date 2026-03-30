---
name: services-instructions
description: "Use when: creating or modifying API services, device data access, authentication, or external integrations"
applyTo: "**/services/**"
---

# Service Development Guidelines

## Creating a Service

### 1. What is a Service?

Services encapsulate:
- **API communication** (backend requests)
- **Device data access** (battery, sensors, device info)
- **External system integration** (permissions, auth, notifications)
- **Complex business logic** (data transformation, calculations)

**NOT services**: Simple UI logic, component rendering, styling.

### 2. File Location & Naming
- **Path**: `src/services/yourService.ts` (camelCase)
- **Examples**: `api.ts`, `deviceData.ts`, `permissions.ts`

### 3. Service Structure Template

```typescript
/**
 * Service description: What this service does and why
 * 
 * Used by: Which screens/components use this service
 * Dependencies: External libraries, other services
 */

import { UserProfile, SleepLog } from '../types/user';

const API_BASE_URL = 'http://localhost:8000';
const API_TIMEOUT = 10000; // 10 seconds
const RETRY_ATTEMPTS = 3;

/**
 * Helper: Fetch with timeout
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
 * Service object with methods
 */
export const yourService = {
  /**
   * Get some data from API
   * 
   * @param id - The ID to fetch
   * @returns Object with data or throws error
   * @throws Error if API fails
   */
  async getData(id: string): Promise<any> {
    try {
      console.log('[YourService] Fetching data:', id);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/data/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[YourService] Data fetched successfully');
      return result.data;
    } catch (error) {
      console.error('[YourService] Error fetching data:', error);
      throw error; // Re-throw for caller to handle
    }
  },

  /**
   * Post data to API
   * 
   * @param payload - Data to send
   * @returns Response data
   * @throws Error if API fails
   */
  async postData(payload: any): Promise<any> {
    try {
      console.log('[YourService] Posting data:', payload);

      const response = await fetchWithTimeout(`${API_BASE_URL}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[YourService] Data posted successfully');
      return result;
    } catch (error) {
      console.error('[YourService] Error posting data:', error);
      throw error;
    }
  },
};
```

### 4. API Service Patterns

#### Error Handling

```typescript
// ✅ RIGHT: Re-throw for caller to handle
const submitData = async (data: any) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error; // Let caller decide what to do
  }
};

// Usage
try {
  await submitData(myData);
} catch (error) {
  Alert.alert('Error', 'Failed to submit data');
}

// ❌ WRONG: Silently return error, caller doesn't know
const submitData = async (data: any) => {
  try {
    // ...
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

#### Retry Logic

```typescript
const submitWithRetry = async (
  data: any,
  maxRetries: number = 3
): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn(`[Attempt ${attempt}/${maxRetries}] Failed:`, error);
      if (attempt === maxRetries) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};
```

#### Offline Support

Services should throw errors when offline—let the caller (AppContext) handle queueing:

```typescript
// In AppContext.addSleepLog()
try {
  await submitSleepLog(log); // Throws if offline
  // Mark as synced
} catch (error) {
  // Keep in queue, retry later
  console.warn('Offline, will retry:', error);
}
```

### 5. Device Data Service Pattern

```typescript
export const deviceDataService = {
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Get info from react-native-device-info
      const [model, os, battery] = await Promise.all([
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getBatteryLevel(),
      ]);
      
      return { model, os, battery };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {}; // Return empty object, not error
    }
  },

  async getSensorData(): Promise<SensorData> {
    // Handle gracefully if sensors unavailable
    try {
      // Access acelerometer, gyro, etc
      return sensorData;
    } catch (error) {
      console.warn('Sensors not available:', error);
      return null; // Return null if unavailable
    }
  },
};
```

### 6. Permissions Service Pattern

```typescript
export const permissionsService = {
  async requestPermission(permission: string): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') return false;
      
      const result = await PermissionsAndroid.request(permission, {
        title: 'Permission Required',
        message: 'This app needs access to...',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      });
      
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  },

  async checkPermission(permission: string): Promise<boolean> {
    try {
      return await PermissionsAndroid.check(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },
};
```

### 7. Logging Best Practice

```typescript
// Prefix all logs with [ServiceName]
console.log('[YourService] Fetching user data:', userId);
console.warn('[YourService] Retry attempt 2/3');
console.error('[YourService] Failed to submit:', error);
```

### 8. Constants

Keep all constants at the top:

```typescript
const API_BASE_URL = 'http://localhost:8000';
const API_TIMEOUT = 10000;
const STORAGE_KEY = '@app_cache';
const RETRY_ATTEMPTS = 3;
```

### 9. Type Safety

```typescript
// ✅ RIGHT: Typed parameters and returns
async submitUserData(userData: UserProfile): Promise<{ userId: string }> {
  // ...
}

// ❌ WRONG: No types
async submitUserData(userData) {
  // ...
}
```

### 10. Documentation

Every service function should have JSDoc:

```typescript
/**
 * Submits user profile to backend
 * 
 * @param userData - User profile with age, gender, etc
 * @returns Promise with userId
 * @throws Error if API fails or offline
 * 
 * @example
 * const { userId } = await submitUserData(userData);
 */
async submitUserData(userData: UserProfile): Promise<{ userId: string }> {
  // ...
}
```

## API Endpoint Patterns

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| Create | POST | `/api/onboarding` | User setup data |
| Log Sleep | POST | `/api/sleep-logs` | New sleep entry |
| Update Log | PUT | `/api/sleep-logs/:id` | Update existing entry |
| Get History | GET | `/api/sleep-logs` | User's sleep history |
| Get Queue | GET | `/api/sync-queue` | Pending items |

## Testing Checklist

- ✅ Function handles success case
- ✅ Function throws error on API failure
- ✅ Function handles network timeout
- ✅ Function has proper logging ([ServiceName] prefixes)
- ✅ Types are correct (no `any`)
- ✅ Error messages are helpful
- ✅ No hardcoded values (use constants)

## Current Services

- **api.ts**: Backend communication (onboarding, sleep logs, sync)
- **deviceData.ts**: Device info (battery, model, OS)
- **permissions.ts**: Android permission requests
