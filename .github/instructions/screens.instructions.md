---
name: screens-instructions
description: "Use when: creating new screens, adding navigation routes, or building features that require new screen components"
applyTo: "**/screens/**"
---

# Screen Development Guidelines

## Creating a New Screen

### 1. File Location & Naming
- **Path**: `src/screens/YourScreenName.tsx` (PascalCase)
- **Example**: `DashboardScreen.tsx`, `SleepLoggingScreen.tsx`

### 2. Component Structure Template

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

interface YourScreenNameProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'YourScreenName'>;
}

export const YourScreenName: React.FC<YourScreenNameProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const appContext = useAppContext(); // Only if you need global state

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount (if needed)
  React.useEffect(() => {
    // Initialize screen
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎯</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Your Screen Title
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Optional subtitle or description
        </Text>
      </View>

      {/* Content Sections */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {/* Your content here */}
      </View>

      {/* Footer/CTA */}
      <View style={styles.submitSection}>
        {/* Primary button or action */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.title - 4,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.caption,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  submitSection: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
```

### 3. UX Patterns to Follow

- **Header**: Always include emoji (32px) + centered title + optional subtitle
- **Cards**: Use consistent card styling with theme colors
- **Sections**: Group related fields in cards with emoji + section title
- **Buttons**: Use `PrimaryButton` component for CTAs
- **Spacing**: Use `spacing.*` constants, never hardcode pixels
- **Loading**: Show `ActivityIndicator` during async operations
- **Errors**: Use `Alert.alert()` for user-facing errors

### 4. Adding to Navigation

1. Update `src/navigation/AppNavigator.tsx`:
   - Add route to `RootStackParamList` type
   - Import your component
   - Add `<Stack.Screen name="YourScreenName" component={YourScreenName} options={...} />`

2. Example:
   ```typescript
   export type RootStackParamList = {
     Dashboard: undefined;
     YourScreenName: undefined; // Add here
   };
   
   <Stack.Screen
     name="YourScreenName"
     component={YourScreenName}
     options={{
       title: 'Your Screen Title',
       headerBackTitle: 'Back',
     }}
   />
   ```

### 5. Using Context & Services

```typescript
// ✅ Access global state
const appContext = useAppContext();
console.log(appContext.userData); // Read
await appContext.addSleepLog(log); // Write + persist + queue sync

// ✅ Read theme colors
const { colors, isDark } = useTheme();
style={{ backgroundColor: colors.primary }}

// ✅ Call services
const deviceInfo = await deviceDataService.getDeviceInfo();
await permissionsService.requestAllPermissions();
```

### 6. Form Validation Pattern

```typescript
const validate = (): boolean => {
  if (!fieldValue.trim()) {
    Alert.alert('Validation', 'Field is required.');
    return false;
  }
  if (!isValidFormat(fieldValue)) {
    Alert.alert('Validation', 'Invalid format.');
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validate()) return;
  
  try {
    setIsLoading(true);
    // Do something
    Alert.alert('Success ✅', 'Operation completed successfully.');
  } catch (error) {
    Alert.alert('Error', 'Something went wrong.');
  } finally {
    setIsLoading(false);
  }
};
```

### 7. Testing Checklist

- ✅ Screen renders without TypeScript errors
- ✅ Form validation works (required fields)
- ✅ Submit button disables during loading
- ✅ Theme toggle works (light/dark colors update)
- ✅ No console warnings
- ✅ Navigation forward/back works
- ✅ Data persists (if using AppContext)

## Stub Screens

For future features, use the stub template:

```typescript
import StubScreenTemplate from './StubScreenTemplate';

export const YourFeatureScreen: React.FC = () => (
  <StubScreenTemplate
    icon="🎯"
    title="Your Feature"
    description="Feature coming soon"
  />
);
```

Update the `RootStackParamList` and navigator, then implement when ready.
