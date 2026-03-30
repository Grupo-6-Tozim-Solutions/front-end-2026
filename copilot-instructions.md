# Sleep & Screen App - Copilot Instructions

**Project**: React Native + Expo sleep tracking and screen time analysis app  
**Target**: Android (API 30+)  
**Stack**: React Native 0.83, TypeScript 5.9, React Navigation 7.x, Expo 55

---

## 🎯 Core Principles

1. **Type Safety**: Always use TypeScript. No `any` types unless absolutely unavoidable.
2. **Reusability**: Create hooks, context, services—not inline logic.
3. **Offline-First**: All data saved to AsyncStorage. Sync to backend when online.
4. **Consistent Naming**: Use PascalCase for components, camelCase for utils/functions, SCREAMING_SNAKE_CASE for constants.
5. **Accessibility**: Consider a11y—semantic components, keyboard nav, color contrast.
6. **Testing**: User-facing features need manual test steps (document in PR/commit).

---

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components (FormInput, PrimaryButton, etc)
├── contexts/        # Global state (ThemeContext, AppContext)
├── screens/         # Screen components (Welcome, Dashboard, SleepLogging, etc)
├── services/        # API, device, permissions, utilities
├── navigation/      # React Navigation stacks & configuration
├── styles/          # Theme colors, typography, spacing
├── types/           # TypeScript interfaces & types
└── assets/          # Images, icons, etc

.github/
├── instructions/    # File-specific guidelines
├── agents/          # Custom Copilot agents
├── prompts/         # Reusable task templates
└── README.md        # Guide to this folder

App.tsx             # Root with providers (AppProvider > ThemeProvider > Navigator)
index.ts            # Expo entry
app.json            # Expo config
tsconfig.json       # TypeScript config
```

---

## 🎨 Style & Theme System

**Location**: `src/styles/theme.ts`

All colors, typography, spacing are centralized. **Never hardcode colors or dimensions.**

```typescript
// ✅ RIGHT
const { colors, statusBar } = useTheme();
<View style={{ backgroundColor: colors.primary }} />

// ❌ WRONG
<View style={{ backgroundColor: '#6366F1' }} />
```

**Responsive spacing**:
- `spacing.xs` = 4px
- `spacing.sm` = 8px
- `spacing.md` = 12px
- `spacing.lg` = 16px
- `spacing.xl` = 20px
- etc.

---

## 🧩 Component Patterns

### Creating a New Component

1. **File location**: `src/components/YourComponent.tsx`
2. **TypeScript props interface**:
   ```typescript
   interface YourComponentProps {
     label: string;
     value: string;
     onChange: (value: string) => void;
     placeholder?: string;
     disabled?: boolean;
   }
   ```
3. **Use theme & styles**:
   ```typescript
   export const YourComponent: React.FC<YourComponentProps> = (props) => {
     const { colors } = useTheme();
     return <View style={{ backgroundColor: colors.surface }} />;
   };
   ```
4. **Stylesheet at bottom**—keep in same file, not external CSS.

### Common Components

- **FormInput**: Text input with label, validation UI
- **PrimaryButton**: CTA button in primary color
- **SliderInput**: Range slider with labels
- **ThemeToggle**: Dark/light mode toggle (in header)

---

## 📱 Screen Patterns

### Creating a New Screen

1. **File location**: `src/screens/YourScreen.tsx`
2. **Props interface**:
   ```typescript
   interface YourScreenProps {
     navigation?: NativeStackNavigationProp<...>;
     route?: RouteProp<...>;
   }
   ```
3. **Structure**:
   ```typescript
   export const YourScreen: React.FC<YourScreenProps> = ({ navigation }) => {
     const { colors } = useTheme();
     const appContext = useAppContext(); // If you need global state
     
     return (
       <ScrollView style={{ backgroundColor: colors.background }}>
         {/* Header with emoji + title */}
         {/* Form sections or content */}
         {/* Submit button or CTA */}
       </ScrollView>
     );
   };
   ```

### Adding to Navigation

1. Update `src/navigation/AppNavigator.tsx`
2. Add to `RootStackParamList` type
3. Add `<Stack.Screen name="YourScreen" ... />`

### Screen UX Pattern

Every screen follows a consistent UX:
- **Header**: Emoji (32px) + Title + Subtitle
- **Content**: Cards with sections (emoji + title)
- **Form fields**: Label → Input component
- **Footer**: Submit button + disclaimer

---

## 🌍 State Management (AppContext)

**Location**: `src/contexts/AppContext.tsx`

Global state for:
- `isOnboarded` — User completed setup
- `userData` — UserProfile (age, gender, sleep times, etc)
- `sleepLogs` — Array of SleepLog entries
- `syncQueue` — Pending items to sync to backend

### Using AppContext

```typescript
const appContext = useAppContext();

// Read state
console.log(appContext.userData);
console.log(appContext.sleepLogs);

// Update state (persists + queues sync)
await appContext.updateUserData({ age: "28", gender: "M", ... });
await appContext.addSleepLog({ date: "2026-03-29", hoursSlept: "7.5", ... });

// Manual sync
await appContext.syncWithBackend();
```

**Important**: Always `await` context functions—they handle AsyncStorage I/O.

---

## 🔧 Services

### deviceData.ts
Reads device info (battery, device model, OS version).

```typescript
const deviceInfo = await deviceDataService.getDeviceInfo();
const battery = await deviceDataService.getBatteryLevel();
```

### permissions.ts
Manages Android permissions (BODY_SENSORS, PACKAGE_USAGE_STATS).

```typescript
await permissionsService.requestAllPermissions();
const status = await permissionsService.checkAllPermissionsStatus();
```

### api.ts
Backend communication with offline queuing.

```typescript
await submitOnboarding(userData);
await submitSleepLog(sleepLog);
```

---

## 💾 Data Types

**Location**: `src/types/user.ts`

- **UserProfile**: age, gender, screenTimePerDay, bedTime, wakeTime, sleepQuality, stressLevel
- **SleepLog**: date, hoursSlept, bedTimeActual, wakeTimeActual, quality, notes, timestamp, syncStatus
- **AppContextType**: Interface for context
- **PermissionStatus**: granted | denied | unknown

**Always import types from `src/types/user.ts`**—don't inline interfaces.

---

## 🔐 Security & Permissions

### Android Permissions

Declared in `app.json` (Expo config):
- `android.permissions` — BODY_SENSORS, PACKAGE_USAGE_STATS
- Request at runtime via `permissionsService`

### Sensitive Data

- **Never hardcode** API keys, tokens, secrets
- Use environment variables: `.env` (not in git)
- Sensitive data (tokens) → encrypted storage (future: `react-native-keychain`)

### Data Privacy

- All user data stays on device (AsyncStorage)
- Only synced to backend when user enables sync
- Include privacy disclaimers in relevant screens

---

## 🧪 Testing Checklist

For every new screen/feature, test:

1. ✅ Screen renders without errors
2. ✅ Form validation works (required fields, format)
3. ✅ Data persists after app restart
4. ✅ Offline: Create entry → data saved locally
5. ✅ Online: Data syncs to backend (mock or real API)
6. ✅ Theme toggle works (light/dark)
7. ✅ Navigation forward & back works
8. ✅ No console warnings/errors

---

## 📝 Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase | `FormInput`, `PrimaryButton` |
| Hook | camelCase, prefix `use` | `useTheme`, `useAppContext` |
| Function | camelCase | `validateEmail`, `handleSubmit` |
| Variable | camelCase | `userData`, `sleepLogs` |
| Constant | SCREAMING_SNAKE_CASE | `STORAGE_KEYS`, `API_TIMEOUT` |
| Type/Interface | PascalCase | `UserProfile`, `SleepLog` |
| File (component) | PascalCase.tsx | `DashboardScreen.tsx` |
| File (service) | camelCase.ts | `api.ts`, `permissions.ts` |
| File (context) | PascalCase.tsx | `AppContext.tsx` |

---

## 🚀 Workflow: Adding a New Feature

1. **Create types** → `src/types/user.ts` (if new data model)
2. **Create service** → `src/services/yourService.ts` (if API/device access)
3. **Create screen** → `src/screens/YourScreen.tsx`
4. **Add navigation** → Update `AppNavigator.tsx`
5. **Add to context** → If global state needed
6. **Test** → Manual E2E (Expo Go or simulator)
7. **Document** → In PR or code comments

See `.github/agents/add-feature.agent.md` for guided workflow.

---

## 🔗 Quick Links

- **Setup Instructions**: `.github/README.md`
- **File-Specific Guidelines**: `.github/instructions/`
- **Custom Agents**: `.github/agents/`
- **Templates & Prompts**: `.github/prompts/`
- **React Navigation Docs**: https://reactnavigation.org/
- **Expo Docs**: https://docs.expo.dev/

---

## ❓ When to Ask Copilot

✅ **Good**: "Create a new screen for [feature]" — Use `.github/agents/add-feature.agent.md`
✅ **Good**: "Refactor this component to use hooks" — Use default Copilot
✅ **Good**: "Add a new API endpoint for [data]"
✅ **Good**: "Fix this TypeScript error"

❌ **Not ideal**: General programming questions (console logs, basic React, etc)
❌ **Not ideal**: Architecture questions without context (use working agreement docs)

---

## 📌 Last Updated

**Date**: 2026-03-29  
**Version**: 2.0 (Post-Refactor: Onboarding → Dashboard)  
**Contributors**: Team  

For updates, edit this file and commit to `main`.
