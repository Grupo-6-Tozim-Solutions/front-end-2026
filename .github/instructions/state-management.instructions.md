---
name: state-management-instructions
description: "Use when: managing global state, using AppContext, persisting data to AsyncStorage, or handling synchronization"
applyTo: "**/contexts/**"
---

# State Management Guidelines

## AppContext Pattern

**Location**: `src/contexts/AppContext.tsx`

The app uses **React Context API** for global state (not Redux). No Redux, Zustand, or MobX.

### When to Use AppContext

Use AppContext for:
- ✅ User data (profile, settings)
- ✅ Sleep logs and history
- ✅ Onboarding status
- ✅ Sync queue (offline support)

**Don't use** for:
- ❌ Form temporary state (use component state)
- ❌ UI state like modal visibility (use component state)
- ❌ Theme (use ThemeContext instead)

### Current State Structure

```typescript
interface AppContextType {
  // State
  isOnboarded: boolean;
  userData: UserProfile | null;
  sleepLogs: SleepLog[];
  isLoading: boolean;
  syncQueue: SleepLog[];
  
  // Actions
  setOnboarded: (value: boolean) => Promise<void>;
  updateUserData: (data: UserProfile) => Promise<void>;
  addSleepLog: (log: SleepLog) => Promise<void>;
  updateSleepLog: (id: string, log: Partial<SleepLog>) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  loadUserData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}
```

### Using AppContext in a Component

```typescript
import { useAppContext } from '../contexts/AppContext';

export const YourScreen: React.FC = () => {
  const appContext = useAppContext();

  // Read state
  const { userData, sleepLogs, isOnboarded } = appContext;

  // Write state (always await)
  const handleSaveData = async () => {
    try {
      await appContext.updateUserData({ age: '28', gender: 'M', ... });
      // Automatically persisted + queued for sync
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Check sync queue
  const pendingItems = appContext.syncQueue.length;

  return (
    <View>
      {/* Use state */}
    </View>
  );
};
```

## Persistence (AsyncStorage)

### How It Works

1. **Save**: All data automatically persisted to AsyncStorage when you call context actions
2. **Load**: On app start, AppContext loads from AsyncStorage
3. **Sync**: Updated data queued to backend (retries automatically every 30s)

### Storage Keys

```typescript
const STORAGE_KEYS = {
  USER_DATA: '@app_user_data',
  SLEEP_LOGS: '@app_sleep_logs',
  IS_ONBOARDED: '@app_is_onboarded',
  SYNC_QUEUE: '@app_sync_queue',
};
```

### Important: Always Await Context Actions

```typescript
// ✅ RIGHT: Await persistence
const result = await appContext.updateUserData(userData);

// ❌ WRONG: Don't await
appContext.updateUserData(userData);
// Data might not be saved yet!
```

### Auto-Persistence Flow

```
updateUserData(data)
  ↓
setState(data)  // Immediate UI update
  ↓
AsyncStorage.setItem()  // Persist to disk
  ↓
submitOnboarding(data)  // Try sync to backend
  ↓→ Success: ✅ synced
  └→ Fail: ⏳ queued for retry
```

## Offline-First Sync

### How Sync Works

1. **Create**: User creates new sleep log locally
2. **Queue**: Automatically added to `syncQueue`
3. **Sync**: Every 30 seconds, AppContext tries to send queued items
4. **Retry**: If submission fails, stays in queue
5. **Success**: Item removed from queue, marked as synced

### Checking Sync Status

```typescript
const appContext = useAppContext();

// Items pending sync
const pending = appContext.syncQueue.length;

// Manually trigger sync
await appContext.syncWithBackend();

// Check if specific item is synced
const isSynced = !appContext.syncQueue.some(item => item.id === log.id);
```

### Backend Endpoints for Sync

| Action | Endpoint | Status Code |
|--------|----------|-------------|
| Submit onboarding | `POST /api/onboarding` | 200 |
| Submit sleep log | `POST /api/sleep-logs` | 201 |
| Update sleep log | `PUT /api/sleep-logs/:id` | 200 |
| Get sync queue status | `GET /api/sync-queue` | 200 |

## Adding New Global State

If you need to add new global state:

### 1. Update UserProfile or SleepLog Type

**File**: `src/types/user.ts`

```typescript
export interface UserProfile {
  // ... existing fields
  newField: string; // Add here
}
```

### 2. Update Persistence Storage

**File**: `src/contexts/AppContext.tsx`

```typescript
const STORAGE_KEYS = {
  // ... existing keys
  NEW_DATA: '@app_new_data',
};
```

### 3. Add State & Action to AppContext

```typescript
// In AppContextType interface
newData: any;
updateNewData: (data: any) => Promise<void>;

// In AppProvider component
const [newData, setNewData] = useState<any>(null);

// In loadUserData effect
const newDataStr = await AsyncStorage.getItem(STORAGE_KEYS.NEW_DATA);
if (newDataStr) setNewData(JSON.parse(newDataStr));

// Add action method
const updateNewData = async (data: any) => {
  try {
    setNewData(data);
    await AsyncStorage.setItem(STORAGE_KEYS.NEW_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error updating new data:', error);
  }
};
```

### 4. Add to Provider Value

```typescript
<AppContext.Provider
  value={{
    // ... existing values
    newData,
    updateNewData,
  }}
>
```

## Loading State & Initialization

On app start, AppContext shows loading screen:

```typescript
if (appContext.isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
```

The app waits for `isLoading = false` before rendering navigation. This ensures:
- User data is loaded from storage
- Onboarded status is known
- Sync queue is initialized

## Error Handling

AppContext catches and logs errors, but doesn't throw. Components should handle errors themselves:

```typescript
try {
  await appContext.addSleepLog(log);
  // Success
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', 'Failed to save sleep log');
}
```

## Debugging

### Check What's in Storage

```typescript
// Add to a debug screen or use React DevTools
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const stores = await AsyncStorage.multiGet(keys);
  console.log('Storage:', stores);
};
```

### Monitor Sync Queue

In AppNavigator or Dashboard:

```typescript
if (appContext.syncQueue.length > 0) {
  console.log('Pending syncs:', appContext.syncQueue.length);
  // Show badge or indicator
}
```

### Check isOnboarded Logic

Navigation is conditional on `isOnboarded`:

```typescript
// AppNavigator.tsx
{appContext.isOnboarded ? <MainStack /> : <OnboardingStack />}
```

## Best Practices

✅ **Always type context values**—no `any` types  
✅ **Await context functions**—they're async  
✅ **Check isLoading**—app context initializes on mount  
✅ **Handle errors**—wrap in try/catch  
✅ **Log with prefix**—`[AppContext]` for debugging  
✅ **Test persistence**—close app and reopen  
✅ **Test offline**—disable network and add item, should queue  

## Current Implementation Details

### Auto-sync Interval
```typescript
const interval = setInterval(() => {
  if (syncQueue.length > 0) {
    syncWithBackend();
  }
}, 30000); // Every 30 seconds
```

### Retry Logic
Each item in sync queue attempts submission. If fails, stays in queue and retries next interval.

### Marking as Synced
Once submitted successfully, items removed from queue and updated in sleepLogs with `syncStatus: 'synced'`.

## When Things Go Wrong

### "Data not persisting"
→ Check: Are you awaiting the action? `await appContext.updateUserData()`  
→ Check: Is AsyncStorage working? Use debugStorage()

### "Item not syncing"
→ Check: Is backend endpoint reachable?  
→ Check: Is item in syncQueue? Use console.log  
→ Check: Is sync interval running? (every 30s)

### "User sees old data after restart"
→ Check: Is loadUserData running? (runs on mount)  
→ Check: Is isLoading being respected? (await isLoading = false)
