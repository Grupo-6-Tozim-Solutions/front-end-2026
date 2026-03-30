---
name: integrate-android-api
description: "Use to: integrate native Android APIs (Google Fit, UsageStatsManager, permissions, sensors, battery) via native bridges or Expo plugins"
applyTo: []
---

# Prompt: Integrate an Android Native API

Use this when you need to access native Android functionality that's not available via JavaScript.

**Type this in chat:**
```
/integrate-android-api

API name: Which native API? (e.g., "Google Fit", "UsageStatsManager", "Sensor Manager")
Feature: What data/feature? (e.g., "sleep time", "screen time", "step count")
Current implementation: How is it handled now? (e.g., "returns null", "throws error")
Desired behavior: What should it return?
```

---

## Current Limitations & Solutions

### ❌ Screen Time / App Usage

**Current State**: `deviceDataService.getScreenTimeData()` returns `null`

**Android API Options**:

1. **UsageStatsManager** (Recommended, but slower)
   - Accurate app usage data
   - Requires `PACKAGE_USAGE_STATS` permission in manifest
   - Runtime permission not available (permission auto-granted if in manifest)
   - Data available only if phone uptime > 1 hour

2. **Battery Manager + Kernel Logs** (Complex)
   - Read `/proc/stat` for device uptime
   - Not reliable for app-specific data

3. **Google Play Services** (Need to link manually)
   - Requires AndroidX setup
   - Slower integration

**Recommended Approach**:
```typescript
// src/services/native-api.ts (NEW)
// Pseudo-code for native bridge

// On Android side: Create custom Expo plugin that:
// 1. Imports UsageStatsManager
// 2. Queries app usage for past 24h
// 3. Sums up screen-on time
// 4. Returns to JS via NativeModules

// In JS:
import { NativeModules } from 'react-native';

const { UsageStatsModule } = NativeModules;

export async function getScreenTimeAndroid() {
  try {
    const screenTime = await UsageStatsModule.getScreenTimeToday();
    return screenTime; // milliseconds
  } catch (error) {
    return null;
  }
}
```

**Steps to Implement**:
1. Create `expo-plugins/expo-usage-stats/` directory
2. Write Android-specific code (Java/Kotlin) in `android/` subdirectory
3. Register plugin in `app.json`
4. Build & test on Android device/emulator

---

### ❌ Sleep Data from Health/Fitness APIs

**Current State**: Manual input only

**Android API Options**:

1. **Google Fit API** (Best for users with Google Fit app)
   - Step count, heart rate, sleep sessions
   - Requires Google Play Services
   - User must have Google Fit or compatible app
   - Non-intrusive (read-only access)

2. **Health Connect** (Emerging standard, Android 14+)
   - Universal health data repo
   - Many apps contribute to it
   - Unified permissions model
   - Recommended for new apps

3. **Wear OS Integration** (If user has smartwatch)
   - Real sleep tracking from smartwatch
   - More accurate than phone-based

**Recommended Approach**:
```typescript
// Option 1: Google Fit (if user has it)
// Install: npm install @react-native-google-fit/google-fit

// Option 2: Health Connect (newer, recommended)
// Wait for expo-health-connect to mature, or build custom plugin

// Hybrid approach (start with manual, graduate to auto):
// 1. Current: User inputs sleep data manually
// 2. Future: Check if Health Connect available
// 3. If yes: Pre-fill with Health Connect data
// 4. If no: Let user input manually
// 5. Always allow manual override
```

**Implementation Priority**:
- ⭐⭐⭐ Manual input (DONE)
- ⭐⭐ Google Fit integration (Medium effort)
- ⭐ Health Connect integration (Emerging API)

---

### ⚠️ Sensors (Accelerometer, Gyro)

**Current State**: `PermissionsScreen` requests `BODY_SENSORS` (available)

**Android APIs**:

1. **Sensor Manager** (Built-in)
   - Accelerometer (motion detection)
   - Gyroscope (rotation)
   - Magnetometer (direction)
   - Android native access required

2. **Pedometer** (via Sensor Manager)
   - Step count (if device supports)
   - Real-time updates

**Available via Expo**:
```bash
npm install expo-sensors
```

```typescript
import { Accelerometer, Pedometer } from 'expo-sensors';

// Check if supported
const hasPedometer = await Pedometer.isAvailableAsync();

// Listen for steps
const subscription = Pedometer.watchStepCount(result => {
  console.log('Steps today:', result.steps);
});
```

**No native bridge needed** — Expo already wraps it!

---

### ✅ Battery Status (Already Working)

Uses `react-native-device-info`:
```typescript
import DeviceInfo from 'react-native-device-info';

const level = await DeviceInfo.getBatteryLevel(); // 0-1
const isCharging = await DeviceInfo.isCharging();
```

**No changes needed — it works!**

---

## How to Create a Native Bridge

### For Simple Features (Like UsageStatsManager)

**File Structure**:
```
expo-plugins/
  expo-usage-stats/
    android/
      src/
        main/
          java/com/example/expoUsageStats/
            UsageStatsModule.kt        # Android implementation
            UsageStatsPackage.kt       # Package definition
    ios/                              # Leave empty for now
    app.json                          # Plugin config
    build.gradle                      # Build config
```

**Step 1: Android Implementation** (`UsageStatsModule.kt`):
```kotlin
package com.example.expoUsageStats

import android.content.Context
import android.app.usage.UsageStatsManager
import android.app.usage.UsageStats
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.util.Calendar

class UsageStatsModule(context: ReactContext) :
    ReactContextBaseJavaModule(context) {

    override fun getName() = "UsageStatsModule"

    @ReactMethod
    fun getScreenTimeToday(promise: Promise) {
        try {
            val context = reactApplicationContext
            val manager = context.getSystemService(
                Context.USAGE_STATS_SERVICE
            ) as UsageStatsManager

            val cal = Calendar.getInstance()
            val endTime = System.currentTimeMillis()
            cal.add(Calendar.DAY_OF_YEAR, -1)
            val beginTime = cal.timeInMillis

            val statsList = manager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                beginTime,
                endTime
            )

            var totalScreenTime = 0L
            for (stats in statsList) {
                totalScreenTime += stats.totalTimeInForeground
            }

            promise.resolve(totalScreenTime)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
```

**Step 2: Register Module** (`UsageStatsPackage.kt`):
```kotlin
package com.example.expoUsageStats

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class UsageStatsPackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(UsageStatsModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

**Step 3: Register in app.json**:
```json
{
  "expo": {
    "plugins": [
      [
        "./expo-plugins/expo-usage-stats",
        {}
      ]
    ]
  }
}
```

**Step 4: Use in JS**:
```typescript
import { NativeModules } from 'react-native';

const { UsageStatsModule } = NativeModules;

export async function getScreenTimeToday() {
  try {
    const ms = await UsageStatsModule.getScreenTimeToday();
    const hours = ms / (1000 * 60 * 60);
    return Math.round(hours * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('Failed to get screen time:', error);
    return null;
  }
}
```

---

## Integration Checklist

### Before Starting
- [ ] Understand what Android API you need (docs.android.com)
- [ ] Check if Expo already wraps it (unlikely for newer APIs)
- [ ] Decide: Build plugin vs Call native code directly

### Plugin Development
- [ ] Create plugin folder structure
- [ ] Write Android implementation (Kotlin or Java)
- [ ] Register module/package
- [ ] Test on emulator with sample code
- [ ] Add error handling
- [ ] Document return types (Promise)

### JavaScript Integration
- [ ] Import NativeModules
- [ ] Call async method
- [ ] Handle errors (promise.reject)
- [ ] Add to service layer (e.g., `deviceDataService`)
- [ ] Add fallback (return null if API unavailable)
- [ ] Test on real device if possible

### Permissions
- [ ] Add to AndroidManifest.xml: `<uses-permission>`
- [ ] Request at runtime if needed (BODY_SENSORS does)
- [ ] Document permission in `src/services/permissions.ts`
- [ ] Show permission request screen if first-time

### Testing
- [ ] Works on emulator
- [ ] Works on real device
- [ ] Graceful fallback if unavailable
- [ ] No crashes on permission denial

---

## Recommended Next Steps

### Priority 1: Pedometer (Lowest effort, Highest value)
```bash
npm install expo-sensors
# Already done! Just use Pedometer.watchStepCount()
```

### Priority 2: Google Fit Integration (Medium effort)
```bash
npm install @react-native-google-fit/google-fit
# Requires Google Play Services setup
```

### Priority 3: UsageStatsManager Bridge (Higher effort)
- Create custom Expo plugin (Kotlin/Java)
- ~200 lines of code
- Most accurate for screen time

### Priority 4: Health Connect (Emerging, wait for Expo support)
- Monitor `expo-health-connect` on GitHub
- Currently in development
- Will be standard in future

---

## Resources

- [Android UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [Google Fit REST API](https://developers.google.com/fit)
- [Health Connect Docs](https://developer.android.com/guide/health-and-fitness/health-connect)
- [Expo Plugins Guide](https://docs.expo.dev/guides/config-plugins/)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-android)

---

## Common Issues

### "java.lang.SecurityException: Permission denied"
- Add permission to AndroidManifest.xml
- Or request at runtime

### "NativeModule not found"
- Check plugin is registered in `app.json`
- Rebuild: `expo prebuild --clean`

### "Method X is not available on emulator"
- Some sensors only work on real device
- Test on physical phone

### "Google Play Services not available"
- Emulator doesn't have Play Services by default
- Use `Google Play System Image` emulator version
- Or test on real device

---

## When to Use This Prompt

✅ **Use this when:**
- You need native Android data (screen time, sleep, steps)
- Current service returns null
- You want to build a custom Expo plugin
- Permission handling is needed

❌ **Don't use for:**
- General architecture (use `/add-feature`)
- TypeScript errors (use `/debug-issue`)
- Basic permission checks (that's in permissions.ts already)

---

## Next: Creating the Plugin

When you're ready to implement:
1. Tell me which API (UsageStatsManager, Google Fit, etc.)
2. I'll generate the full plugin boilerplate
3. You test on emulator
4. We iterate based on results

Type: `/integrate-android-api` to start!
