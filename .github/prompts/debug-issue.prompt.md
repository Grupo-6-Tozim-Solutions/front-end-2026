---
name: debug-issue
description: "Use to: systematically debug crashes, TypeScript errors, permission issues, API failures, or navigation problems"
applyTo: []
---

# Prompt: Debug an Issue

Use this when something isn't working and you need help troubleshooting.

**Type this in chat:**
```
/debug-issue

What's happening: What's the bug/error?
Where: Which screen/component/service?
When: When does it happen? (app start, user action, etc.)
Error message: Exact error text (if any)
Expected behavior: What should happen instead?
```

---

## The Debug Workflow

### Step 1: Check TypeScript Errors

```bash
npm run type-check
# or in VS Code: run "TypeScript: Recompile Project"
```

If you see TS errors:
- Check error column
- Verify type imports
- Compare with similar working code

### Step 2: Check Logs

**In Android emulator**:
```bash
npx expo logs
```

Look for:
- `ERROR` keywords
- `undefined` or `null` references
- Stack traces
- Permission denials

### Step 3: Check Navigation

Is the error on a **specific screen**?
- Verify screen is added to `AppNavigator.tsx`
- Verify route name matches
- Verify params are typed correctly

**Example**: Going to "SettingsScreen" but it's not in the stack?
```typescript
// ❌ This won't work if SettingsScreen isn't added to Stack
navigation.navigate('SettingsScreen');

// ✅ Add it first:
<Stack.Screen name="SettingsScreen" component={SettingsScreen} />
```

### Step 4: Check State

Does the error involve **global state**?
- Is AppContext accessed correctly? (`useAppContext()`)
- Is state initialized? (`appContext?.userData` or just `userData`?)
- Is there a null check?

**Example**:
```typescript
// ❌ Crashes if userData is null
const age = appContext.userData.age;

// ✅ Safe:
const age = appContext.userData?.age || 'Unknown';
```

### Step 5: Check Permissions

Does it involve **device data** (battery, sensors, etc.)?
- Did the user grant permissions?
- Are permissions requested before reading?
- Does the permission exist in `AndroidManifest.xml`?

**Test**:
```bash
# Emulator: Open Settings → Apps → YourApp → Permissions
# Check if permission is GRANTED
```

### Step 6: Check API/Sync

Does it involve **backend calls**?
- Is the backend running? (`http://localhost:8000`)
- Is  URL correct in `api.ts`?
- Check Network tab in dev tools / API response

**Common issues**:
- Backend offline → API call hangs or times out
- Wrong endpoint → 404 error
- Missing headers → 400 error

### Step 7: Check Theme

Does it involve **dark/light mode**?
- Is `useTheme()` imported?
- Is the color available in `theme.ts`?
- Did you use `colors.text` instead of hardcoding `"#000000"`?

**Example**:
```typescript
// ❌ Doesn't change in dark mode
<Text style={{ color: '#000000' }}>Text</Text>

// ✅ Respects theme
<Text style={{ color: colors.text }}>Text</Text>
```

---

## Common Error Patterns

### "Cannot read property 'X' of undefined"

**Cause**: You're trying to access something that doesn't exist.

```typescript
// ❌ userData might be undefined
name = userData.name;

// ✅ Add optional chaining
name = userData?.name || 'Guest';
```

### "Type 'X' is not assignable to type 'Y'"

**Cause**: TypeScript type mismatch.

```typescript
// ❌ age is string, but interface expects number
interface User {
  age: number;
}
const user: User = { age: "25" }; // Error!

// ✅ Match types
const user: User = { age: 25 };
```

### "Screen XYZ does not exist"

**Cause**: Screen not added to navigation.

```typescript
// ✅ Add to AppNavigator.tsx:
<Stack.Screen name="ProfileScreen" component={ProfileScreen} />

// ✅ Add to RootStackParamList:
export type RootStackParamList = {
  ProfileScreen: undefined;
};
```

### "Permission denied"

**Cause**: User didn't grant permission or it's not in manifest.

```typescript
// ✅ In AndroidManifest.xml:
<uses-permission android:name="android.permission.BODY_SENSORS" />

// ✅ Then request at runtime:
await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.BODY_SENSORS
);
```

### "fetch is not defined" in api.ts

**Cause**: Using wrong import or old RN version.

```typescript
// ✅ Use built-in fetch (RN 0.63+)
const response = await fetch(url, options);
```

### "AsyncStorage.multiRemove() is not a function"

**Cause**: Method doesn't exist. Use Promise.all() instead.

```typescript
// ❌ Doesn't exist
await AsyncStorage.multiRemove([key1, key2]);

// ✅ Use Promise.all
await Promise.all([
  AsyncStorage.removeItem(key1),
  AsyncStorage.removeItem(key2),
]);
```

---

## Debugging Checklist

- [ ] **TypeScript errors?** → Run `npm run type-check`
- [ ] **Runtime crash?** → Check `npx expo logs`
- [ ] **Navigation not working?** → Verify screen in `AppNavigator.tsx`
- [ ] **State is undefined?** → Add null checks & optional chaining
- [ ] **Permissions denied?** → Check `AndroidManifest.xml` + request at runtime
- [ ] **API call failing?** → Check backend URL + network
- [ ] **Dark mode broken?** → Use `colors` from `useTheme()`
- [ ] **Button not working?** → Check `onPress` handler + loading state

---

## Quick Fixes

**If app won't start:**
```bash
npx expo start --clear # Clear cache and restart
```

**If emulator frozen:**
```bash
adb kill-server
adb start-server
npx expo start
```

**If types broken:**
```bash
npm run type-check
# Fix any errors shown
```

**If unsure where** the error is:
```bash
# Add console logs:
console.log('=== DEBUG: userData =', userData);
console.log('=== DEBUG: syncQueue length =', syncQueue?.length);

# Then check npx expo logs
```

---

## When to Use This Prompt

✅ **Use this prompt when:**
- App crashes  
- TypeScript error appears
- Button doesn't work
- API call fails
- Permission denied
- Navigation broken
- Theme not working
- State undefined

❌ **Don't use this prompt for:**
- Architecture questions (use `/add-feature` instead)
- Creating new screens (use `/new-screen` instead)
- General how-to questions (ask normally)

---

## Pro Tips

🔍 **Add debug logging**: 
```typescript
console.log('=== Before API call:', userData);
console.log('=== After API call:', response);
```

📱 **Use Expo DevTools**:
```bash
npx expo start
# Press 'd' in terminal for menu
```

🔗 **Check Network requests**:
- Open Android emulator Settings
- Developer Options → Network inspector
- Or use `fetch` with .catch() logging

💾 **Check local data**:
```typescript
// In any screen, temporarily add:
useEffect(() => {
  AsyncStorage.getAllKeys().then(keys => {
    console.log('=== All storage keys:', keys);
    AsyncStorage.multiGet(keys).then(items => {
      console.log('=== All storage data:', items);
    });
  });
}, []);
```

---

## Still Stuck?

Answer these before asking Copilot:
1. What's the exact error message?
2. When does it happen?
3. What did you just change?
4. Have you tested on a clean build (`npm run type-check`)?

Then provide the full error + context in chat.
