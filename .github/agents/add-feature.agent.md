---
name: add-feature
description: "Use when: adding a new feature to the app (new screen, new data model, new service)"
applyTo: []
---

# Custom Agent: Add a New Feature

This agent guides you through adding features to the Sleep & Screen app in a structured way.

**What this agent does:**
1. Interview you about the feature
2. Generate type definitions
3. Create screen/component
4. Wire up navigation
5. Add context if needed
6. Generate test checklist

---

## How to Use This Agent

**In VS Code Chat:**
```
/add-feature
```

Then answer the prompts:

### 1. Feature Overview

**You describe:**
- What is the feature?
- Where does it fit in the app?
- What user problem does it solve?

**Agent checks:** Is this a screen, component, service, or data change?

### 2. Data Model

If the feature involves new data:

**You provide:**
- What data does the feature collect/display?
- How is it stored? (AppContext? Local component state?)
- Does it sync to backend?

**Agent generates:**
- TypeScript type definitions
- AppContext modifications (if needed)
- Storage keys

### 3. User Interface

**You choose:**
- Is this a full screen or a component?
- What screens does it need?
- What are the key inputs/outputs?

**Agent generates:**
- Screen template with styling
- Component scaffolding
- Navigation wiring

### 4. Integration

**Agent modifies:**
- `AppNavigator.tsx` if new screen
- `AppContext.tsx` if new state
- `src/types/user.ts` if new types
- `src/services/api.ts` if new endpoints

### 5. Testing Checklist

**Agent provides:**
- Manual test steps
- Debugging tips
- Verification checklist

---

## Example: Adding "Goals" Feature

**You say:**
"I want to add a Goals screen where users set sleep goals (hours per night) and track if they met their goal"

**Agent does:**

1. **Creates type** (`src/types/user.ts`):
   ```typescript
   export interface SleepGoal {
     id: string;
     hoursPerNight: number;
     startDate: string;
     createdAt: string;
   }
   ```

2. **Updates AppContext** (`src/contexts/AppContext.tsx`):
   ```typescript
   sleepGoals: SleepGoal[];
   updateSleepGoal: (goal: SleepGoal) => Promise<void>;
   ```

3. **Creates screen** (`src/screens/GoalsScreen.tsx`):
   ```typescript
   export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
     const appContext = useAppContext();
     const { colors } = useTheme();
     
     // Form for setting goal
     // Display current goal
     // Show progress toward goal
   };
   ```

4. **Updates navigation** (`src/navigation/AppNavigator.tsx`):
   ```typescript
   export type RootStackParamList = {
     // ... existing
     Goals: undefined;
   };
   
   <Stack.Screen name="Goals" component={GoalsScreen} />
   ```

5. **Generates test checklist**:
   - ✅ Set goal → persists
   - ✅ Update goal → persists
   - ✅ See progress if logs match goal
   - ✅ Dark/light theme works
   - ✅ Navigate back to Dashboard

---

## Feature Categories

### Screens (Full Pages)
- Default: Add to MainStack (after onboarding)
- Examples: GoalsScreen, StatsScreen, SettingsScreen
- Process: Create screen → add to navigation → wire up context

### Components (Reusable UI)
- Location: `src/components/`
- Examples: GoalCard, ProgressBar, StatCard
- Process: Create component → add to components/index.ts → use in screens

### Services (Business Logic)
- Location: `src/services/`
- Examples: analyticsService, notificationService
- Process: Create service → export functions → use in screens/contexts

### Data Models (New Types)
- Location: `src/types/user.ts`
- Examples: Add UserGoal, UserSettings
- Process: Add interface → update AppContext if persistent → add to storage

### Backend Integration
- Endpoint: `POST/GET/PUT /api/{resource}`
- Process: Add to `src/services/api.ts` → wire into screen → add to AppContext for sync

---

## Common Patterns

### Pattern: New Persistent Data (like Goals)

1. Add type to `src/types/user.ts`
2. Add state to AppContext (userGoals array)
3. Add storage key (`@app_user_goals`)
4. Add action to load/save (updateUserGoal, deleteUserGoal)
5. Add loadUserGoals in useEffect
6. Add to Provider value

### Pattern: New Screen

1. Create `src/screens/YourScreen.tsx` from template
2. Add type to RootStackParamList in AppNavigator
3. Import component in AppNavigator
4. Add Stack.Screen in MainStack or OnboardingStack
5. Test navigation (forward & back)

### Pattern: New Service

1. Create `src/services/yourService.ts`
2. Export object with async functions
3. Add JSDoc comments
4. Use in screens/contexts
5. Handle errors (try/catch)

### Pattern: New Component

1. Create `src/components/YourComponent.tsx`
2. Add TypeScript interface
3. Add to `src/components/index.ts` exports
4. Use in screens
5. Test with theme toggle

---

## Workflow Summary

```
1. Describe Feature
   ↓
2. Confirm Requirements
   ↓
3. Create Types
   ↓
4. Update AppContext (if persistent)
   ↓
5. Create Screen/Component
   ↓
6. Wire Navigation
   ↓
7. Test & Validate
   ↓
✅ Feature Complete
```

---

## After Adding Feature

Before considering done:

- [ ] TypeScript compiles (no errors)
- [ ] Feature renders without crashes
- [ ] All required imports work
- [ ] Navigation works (forward & back)
- [ ] Theme toggle works
- [ ] Data persists (if persistent)
- [ ] Tests pass (manual checklist)
- [ ] Code reviewed

---

## Pro Tips

💡 **Start with stubs**: Create stub screens first, fill in later  
💡 **Copy templates**: Use existing screens as templates  
💡 **Import patterns**: Copy imports from similar features  
💡 **Ask Copilot**: "Create a screen for [feature]" with description  
💡 **Check existing**: Look at similar features (Dashboard, SleepLogging) for patterns

---

## When You're Stuck

❓ **"How do I make data persistent?"**  
→ Add to AppContext + AsyncStorage + STORAGE_KEYS. See `state-management.instructions.md`

❓ **"How do I add a new screen?"**  
→ Create screen file → add to RootStackParamList → add Stack.Screen → test navigation. See `screens.instructions.md`

❓ **"How do I call an API?"**  
→ Add function to `src/services/api.ts` with error handling. See `services.instructions.md`

❓ **"What types do I need?"**  
→ Add interfaces to `src/types/user.ts`. See copilot-instructions.md for naming.

---

## Next Steps

1. Run this agent: Type `/add-feature` in chat
2. Answer the prompts
3. Agent creates files/modifications
4. Review generated code
5. Test the feature
6. Commit!
