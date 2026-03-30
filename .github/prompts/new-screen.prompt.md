---
name: new-screen
description: "Use to: quickly scaffold a new screen with theme integration, navigation props, and styling"
applyTo: []
---

# Prompt: Create a New Screen

Use this when you want to quickly create a new screen with all the boilerplate.

**Type this in chat:**
```
/new-screen

Screen name: YourScreenName
Purpose: Brief description of what the screen does
Primary action: What's the main CTA? (e.g., "Submit sleep log", "Save goal")
Uses global state: Yes/No
```

---

## Template

The agent will generate something like this:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { typography, spacing, borderRadius } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

interface YourScreenNameProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'YourScreenName'>;
}

export const YourScreenName: React.FC<YourScreenNameProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const appContext = useAppContext(); // Only if needed

  // State
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      // Your logic here
      Alert.alert('Success ✅', 'Action completed.');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

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
          Your subtitle here
        </Text>
      </View>

      {/* Content */}
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
        {/* Add your content */}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        {isLoading ? (
          <ActivityIndicator size=\"large\" color={colors.primary} />
        ) : (
          <>
            <PrimaryButton
              title=\"Your Action\"
              onPress={handleAction}
              style={styles.button}
            />
            <Text style={[styles.disclaimer, { color: colors.textLight }]}>
              Optional disclaimer text
            </Text>
          </>
        )}
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
  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
  disclaimer: {
    fontSize: typography.small,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
```

---

## After Generation

1. **Replace placeholders**:
   - `YourScreenName` → Real name
   - `🎯` → Appropriate emoji
   - "Your Screen Title" → Real title
   - "Your Action" → Real button text

2. **Add to navigation** (`src/navigation/AppNavigator.tsx`):
   ```typescript
   <Stack.Screen
     name="YourScreenName"
     component={YourScreenName}
     options={{
       title: 'Your Screen Title',
       headerBackTitle: 'Back',
     }}
   />
   ```

3. **Add type to RootStackParamList**:
   ```typescript
   export type RootStackParamList = {
     // ... existing
     YourScreenName: undefined;
   };
   ```

4. **Test**:
   - Does it compile? (No TypeScript errors)
   - Does it render? (No runtime errors)
   - Does navigation work?
   - Does theme toggle work?

---

## Parameters

**Screen name** (required)
- PascalCase, ends with "Screen"
- Examples: DashboardScreen, SettingsScreen, GoalsScreen

**Purpose** (required)
- What does this screen do?
- Example: "Allows users to set daily sleep goals and track progress"

**Primary action** (optional)
- What's the main button/CTA?
- If not provided, no button added

**Uses global state** (optional)
- Does it use AppContext?
- If yes, imports `useAppContext` and includes `appContext` variable

---

## Customization

After getting the template:

- **Add form fields**: Import FormInput, SliderInput, etc.
- **Add sections**: Duplicate `<View style={styles.card}>` blocks
- **Add state**: Add more `useState` for form fields
- **Add navigation**: Use `navigation.navigate(...)` or `navigation.goBack()`
- **Add validation**: Implement `validate()` function before submit

---

## Quick Reference

See also:
- `.github/instructions/screens.instructions.md` — Full screen dev guide
- `copilot-instructions.md` — Project conventions
- Existing screens in `src/screens/` — Examples to copy from

---

## Tips

💡 Copy emoji from existing screens for consistency  
💡 Keep section count to 3-5 (don't overload)  
💡 Always include loading spinner for async operations  
💡 Always include try/catch for error handling  
💡 Test dark mode by toggling theme button
