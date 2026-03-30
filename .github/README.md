# 🤖 Copilot & Development Guide

This folder contains all configuration files for consistent, standardized development using Copilot and following team patterns.

**New to this project?** Start with [`copilot-instructions.md`](#master-guide) below.

---

## 📚 Master Guide

### [`copilot-instructions.md`](../copilot-instructions.md)
**Master guide for the entire project & AI agent standardization**

Read this first. Contains:
- ✅ Core project principles & architecture
- ✅ App structure & folder organization
- ✅ Component naming & patterns
- ✅ Screen lifecycle & patterns
- ✅ State management (AppContext) details
- ✅ Service layer conventions
- ✅ Type system & TypeScript rules
- ✅ Security & permission guidelines
- ✅ Naming conventions (what to call things)
- ✅ When to ask Copilot for help

**Best for**: Understanding how everything fits together | Writing consistent code | Onboarding new developers | Learning team standards

---

## 🎯 File-Specific Instructions

These files help Copilot give **contextual, specific guidance** when you're working in certain folders.

Copilot automatically loads these when you edit files matching the `applyTo` pattern.

### [`instructions/screens.instructions.md`](instructions/screens.instructions.md)
**Creating new screens** (or editing `src/screens/**`)

Contains:
- Screen component template (with theme, navigation, loading states)
- UX patterns (cards, sections, CTAs)
- How to add navigation routes
- Form validation patterns
- Testing checklist
- Stub screen pattern (for placeholders)

**When it loads**: When you create/edit files in `src/screens/`

**Example use**: Creating a "GoalsScreen" → Copilot suggests the template + navigation integration

---

### [`instructions/components.instructions.md`](instructions/components.instructions.md)
**Creating reusable components** (or editing `src/components/**`)

Contains:
- Component file structure
- Props design patterns
- Theme integration via `useTheme()`
- Common component types (buttons, inputs, cards)
- Styling with theme colors
- Accessibility considerations
- Export patterns

**When it loads**: When you create/edit files in `src/components/`

**Example use**: Creating a "SectionCard" → Copilot suggests the component template + TypeScript props

---

### [`instructions/services.instructions.md`](instructions/services.instructions.md)
**Building services & API calls** (or editing `src/services/**`)

Contains:
- Service file structure & patterns
- API call helpers (fetchWithTimeout, retry logic)
- Error handling conventions
- Offline-first sync architecture
- Device data service pattern
- Permissions service pattern
- Logging & debugging setup

**When it loads**: When you create/edit files in `src/services/`

**Example use**: Creating a "goalsService.ts" → Copilot suggests error handling + offline queue patterns

---

### [`instructions/state-management.instructions.md`](instructions/state-management.instructions.md)
**Working with global state** (or editing `src/contexts/**`)

Contains:
- When to use AppContext
- Current AppContext structure (what state exists)
- How to add new state fields
- AsyncStorage persistence patterns
- Offline-first sync queue
- Loading & initialization
- Debugging state issues
- Best practices

**When it loads**: When you create/edit files in `src/contexts/`

**Example use**: Adding a "goals" array to AppContext → Copilot explains initialization + persistence patterns

---

## 🚀 Custom Agents

Use these by typing `/slash-command` in any Copilot chat.

### [`agents/add-feature.agent.md`](agents/add-feature.agent.md)
**Guided workflow for adding a complete feature** (Type: `/add-feature`)

Interactive agent that:
1. **Interviews you** about what feature to build
2. **Designs the data model** (types, interfaces)
3. **Creates UI screens** (forms, displays)
4. **Integrates with state** (AppContext updates)
5. **Connects API** (backend sync)
6. **Tests & validates** (checklist)
7. **Commits your work** (git integration optional)

**Best for**: Adding new major features (Goals, Reminders, Analytics screens, etc.)

**Example flow**:
```
User: /add-feature
Agent: What feature are you building?
User: Weekly sleep goals
Agent: 📋 Collecting requirements...
Agent: 🎨 Designing UI...
Agent: 💾 Creating database schema...
Agent: ✅ Ready to implement — follow these steps...
```

---

## 🧰 Prompt Templates

Reusable prompts for common tasks. Find them in `.github/prompts/`

### [`prompts/new-screen.prompt.md`](prompts/new-screen.prompt.md)
**Quick scaffold for a new screen**

Provides:
- Complete screen template (TypeScript + styling)
- Theme integration pre-configured
- Loading & error states
- Navigation props set up
- How to customize for your needs

**Use it**:
```
/new-screen

Screen name: GoalsScreen
Purpose: Display and manage sleep goals
Primary action: Create new goal
Uses global state: Yes
```

---

### [`prompts/debug-issue.prompt.md`](prompts/debug-issue.prompt.md)
**Systematic debugging workflow**

Guides you through:
- TypeScript error checking
- Log inspection (expo logs)
- Navigation stack validation
- State null-check patterns
- Permission issues
- API/sync problems
- Theme/styling issues

**Use it**:
```
/debug-issue

What's happening: App crashes when I tap sleep log button
Where: SleepLoggingScreen
When: After filling out form and clicking submit
Error message: Cannot read property 'addSleepLog' of undefined
```

---

### [`prompts/integrate-android-api.prompt.md`](prompts/integrate-android-api.prompt.md)
**Integrating native Android APIs** (Google Fit, UsageStatsManager, sensors, etc.)

Explains:
- Current API limitations (what we can't access from JS)
- Android native API options
- How to build custom Expo plugins
- Google Fit integration steps
- Sensor/Pedometer usage
- Permission requirements
- Common errors & fixes

**Use it**:
```
/integrate-android-api

API name: UsageStatsManager
Feature: Screen time reading
Current implementation: Returns null
Desired behavior: Get total screen-on time for today in minutes
```

---

## 🗂️ Directory Structure

```
.github/
├── README.md                          ← You are here
├── copilot-instructions.md            ← Master guide (not in .github, in root)
├── instructions/
│   ├── screens.instructions.md        ← For src/screens/** files
│   ├── components.instructions.md     ← For src/components/** files
│   ├── services.instructions.md       ← For src/services/** files
│   └── state-management.instructions.md ← For src/contexts/** files
├── agents/
│   └── add-feature.agent.md          ← /add-feature agent
└── prompts/
    ├── new-screen.prompt.md           ← /new-screen template
    ├── debug-issue.prompt.md          ← /debug-issue workflow
    └── integrate-android-api.prompt.md ← /integrate-android-api guide
```

---

## 📖 How to Use This

### Scenario 1: Creating a New Screen
1. Read [`instructions/screens.instructions.md`](instructions/screens.instructions.md)
2. Type `/new-screen` in Copilot chat
3. Follow the template & checklist
4. Reference existing screens (e.g., `DashboardScreen.tsx`) for patterns

### Scenario 2: Building a New Feature (Goals)
1. Type `/add-feature` in Copilot chat
2. Follow the guided workflow
3. Reference [`instructions/state-management.instructions.md`](instructions/state-management.instructions.md) for AppContext updates
4. Reference [`instructions/services.instructions.md`](instructions/services.instructions.md) for API service patterns

### Scenario 3: App Crashes or Errors
1. Type `/debug-issue` in Copilot chat
2. Describe the error
3. Follow the systematic troubleshooting steps
4. Check logs: `npx expo logs`

### Scenario 4: Adding Android Permission or Sensor
1. Review [`prompts/integrate-android-api.prompt.md`](prompts/integrate-android-api.prompt.md)
2. Type `/integrate-android-api` if needed
3. Follow permission request pattern in [`instructions/services.instructions.md`](instructions/services.instructions.md)

### Scenario 5: Understanding Overall Architecture
1. Read [`copilot-instructions.md`](../copilot-instructions.md)
2. Skim the specific instruction file relevant to your task
3. Look at existing code as reference (best learning tool)

---

## 🎓 Learning Path

**Recommended reading order for new developers:**

1. Start: [`copilot-instructions.md`](../copilot-instructions.md) — Overall app structure (30 min)
2. Quick refs: Skim the 4 instruction files in `instructions/` (20 min)
3. Practice: Use `/new-screen` to create a simple placeholder screen (15 min)
4. Deep dive: Use `/add-feature` to build a small feature (30+ min)
5. Reference: Keep prompt templates handy for recurring tasks

**Total onboarding time**: ~2 hours to be productive | ~1 week to feel comfortable

---

## ❓ FAQ

### Q: What if I'm not sure what to do?
**A**: Start with `/add-feature`, it interviews you and creates a step-by-step plan.

### Q: How do I create a new screen?
**A**: Use `/new-screen` prompt or read `instructions/screens.instructions.md` first.

### Q: What if something breaks?
**A**: Use `/debug-issue` workflow to troubleshoot systematically.

### Q: Where do I find existing patterns to copy from?
**A**: Check existing screens/components/services in the codebase:
- Screens: `src/screens/DashboardScreen.tsx`, `src/screens/SleepLoggingScreen.tsx`
- Components: `src/components/FormInput.tsx`, `src/components/PrimaryButton.tsx`
- Services: `src/services/api.ts`, `src/services/permissions.ts`
- State: `src/contexts/AppContext.tsx`

### Q: Can I modify these instructions?
**A**: Yes! If you find patterns that work better, update the relevant instruction file and commit it. This keeps documentation aligned with reality.

### Q: What if I use Copilot and it gives different guidance?
**A**: If Copilot gives advice that contradicts these docs:
1. Try both approaches
2. See which feels better for your use case
3. Update the relevant instruction file if needed
4. Commit the change so the team learns too

---

## 🔗 Quick Links

| File | Purpose | Read Time |
|------|---------|-----------|
| [`copilot-instructions.md`](../copilot-instructions.md) | Master guide for everything | 30 min |
| [`instructions/screens.instructions.md`](instructions/screens.instructions.md) | Creating screens | 15 min |
| [`instructions/components.instructions.md`](instructions/components.instructions.md) | Creating components | 10 min |
| [`instructions/services.instructions.md`](instructions/services.instructions.md) | Building services | 15 min |
| [`instructions/state-management.instructions.md`](instructions/state-management.instructions.md) | App state patterns | 15 min |
| [`agents/add-feature.agent.md`](agents/add-feature.agent.md) | Feature workflow | Interactive |
| [`prompts/new-screen.prompt.md`](prompts/new-screen.prompt.md) | Screen template | On demand |
| [`prompts/debug-issue.prompt.md`](prompts/debug-issue.prompt.md) | Debug workflow | On demand |
| [`prompts/integrate-android-api.prompt.md`](prompts/integrate-android-api.prompt.md) | Native API guide | 20 min |

---

## 📝 Contributing to Docs

If you find gaps or errors:
1. Update the relevant instruction file
2. Test your changes with Copilot
3. Commit with a clear message: `docs: clarify X pattern in screens.instructions.md`

---

## 🚀 Getting Started

**Right now?**

👉 Read: [`../copilot-instructions.md`](../copilot-instructions.md)

👉 Then: Do `/new-screen` in Copilot chat

👉 Or: Do `/add-feature` to build something real

---

**Questions?** Check the relevant instruction file first. If not there, Copilot will help!

**Last updated**: 2025  
**Maintained by**: Team  
**Scope**: Project standards & AI assist guidelines
