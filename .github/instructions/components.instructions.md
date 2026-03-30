---
name: components-instructions
description: "Use when: creating reusable UI components, building component libraries, or designing shared component patterns"
applyTo: "**/components/**"
---

# Component Development Guidelines

## Creating a Reusable Component

### 1. File Location & Naming
- **Path**: `src/components/YourComponentName.tsx` (PascalCase)
- **Examples**: `FormInput.tsx`, `PrimaryButton.tsx`, `SliderInput.tsx`

### 2. Component Structure Template

```typescript
import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../styles/theme';

interface YourComponentProps {
  // Required props
  label: string;
  value: string;
  onChange: (value: string) => void;

  // Optional props with defaults
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  style?: ViewStyle;
}

export const YourComponent: React.FC<YourComponentProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          editable={!disabled}
          style={[
            styles.input,
            {
              color: colors.text,
            },
          ]}
        />
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.body,
  },
  error: {
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
});
```

### 3. Props Design Principles

- **Keep props minimal**: Only expose what's necessary
- **Use sensible defaults**: `disabled = false`, optional props should have defaults
- **Type everything**: Use TypeScript interfaces, not `any`
- **Style flexibility**: Include optional `style` prop for consumers to override
- **Callbacks**: Use descriptive names like `onChange`, `onPress`, not `onX`

### 4. Theme Integration

```typescript
// ✅ RIGHT
const { colors } = useTheme();
backgroundColor: colors.primary

// ❌ WRONG
backgroundColor: '#6366F1' // Hardcoded color
```

**Available theme values**:
- `colors.*` — primary, secondary, background, surface, text, border, etc.
- `typography.*` — title, subtitle, body, caption, small, etc.
- `spacing.*` — xs, sm, md, lg, xl, xxl, etc.
- `borderRadius.*` — sm, md, lg, full

### 5. Common Component Types

#### Button Component
- Props: `title`, `onPress`, `disabled`, `loading`
- State: Loading indicator during action
- Feedback: Visual feedback, disabled state

#### Input Component
- Props: `label`, `value`, `onChange`, `placeholder`, `error`, `disabled`
- Validation feedback (show error text)
- Theme integration (colors change with theme)

#### Picker/Select Component
- Props: `label`, `value`, `onChange`, `options`
- Use native `Picker` or custom dropdown
- Show selected value clearly

#### List Component
- Props: `data` (array), `renderItem` (function), `onItemPress`
- Handle empty state
- Optimization: Use FlatList or SectionList for large lists

### 6. Styling Best Practices

```typescript
// ✅ Use theme spacing
marginBottom: spacing.lg

// ✅ Use theme colors
backgroundColor: colors.surface

// ✅ Use theme typography
fontSize: typography.body

// ❌ Never hardcode
marginBottom: 20
backgroundColor: '#f0f0f0'
fontSize: 16
```

### 7. Accessibility Considerations

```typescript
// ✅ Add accessible labels
<TextInput
  accessibilityLabel="Email input"
  placeholderTextColor={colors.textLight}
/>

// ✅ Clear visual feedback for disabled state
opacity: disabled ? 0.5 : 1

// ✅ Sufficient color contrast
// Use theme colors (they're designed for contrast)
```

### 8. Export Pattern

All components should be exported from `src/components/index.ts`:

```typescript
export { YourComponent } from './YourComponent';
export { FormInput } from './FormInput';
export { PrimaryButton } from './PrimaryButton';
```

Then import as:
```typescript
import { YourComponent } from '../components';
```

### 9. Testing Checklist

- ✅ Component renders without errors
- ✅ Props (required & optional) work correctly
- ✅ onChange/onPress callbacks fire
- ✅ Disabled state works
- ✅ Error state displays
- ✅ Theme toggle works (colors update)
- ✅ No console warnings
- ✅ TypeScript types are correct

## Don'ts

❌ Don't use hardcoded colors, spacing, or dimensions  
❌ Don't create complex business logic in components (move to services/hooks)  
❌ Don't add global side effects (API calls, navigations) in component body  
❌ Don't use `any` types  
❌ Don't create components that are only used once (inline instead)

## When to Create a Component

✅ Used in 2+ locations  
✅ Has reusable logic/UI pattern  
✅ Could be easily themed/customized  

❌ Only used once (inline in screen)  
❌ Super simple (just wrapping native component)  
❌ High complexity without clear isolation  

## Existing Components Reference

- **FormInput**: Text input with label, placeholder, error state
- **PrimaryButton**: CTA button with loading state
- **SliderInput**: Range slider with min/max labels
- **ThemeToggle**: Dark/light mode switch (header component)

Check `src/components/` for implementation examples.
