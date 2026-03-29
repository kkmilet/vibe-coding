# Remove AI Vision Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the AI Vision feature (Gemini API integration) from the photography portfolio website.

**Architecture:** Delete the geminiService.ts file, remove AI-related code from PhotoDetailModal.tsx, types.ts, constants.ts, vite.config.ts, and update documentation. The site will function without AI photo analysis.

**Tech Stack:** React 19, TypeScript, Tailwind CSS

---

## File Changes Summary

| File | Action |
|------|--------|
| `services/geminiService.ts` | DELETE entire file |
| `components/PhotoDetailModal.tsx` | Remove AI imports, state, handler, and UI section |
| `types.ts` | Remove AIAnalysisState interface and AI translation fields |
| `constants.ts` | Remove AI translation strings |
| `vite.config.ts` | Remove API_KEY environment mapping |
| `.env.local` | Remove GEMINI_API_KEY line |
| `package.json` | Remove @google/genai dependency |
| `CLAUDE.md` | Update documentation |

---

## Task 1: Delete geminiService.ts

**Files:**
- Delete: `services/geminiService.ts`

- [ ] **Step 1: Verify file exists**

Confirm `services/geminiService.ts` exists and contains Gemini-related code.

- [ ] **Step 2: Delete the file**

```bash
rm services/geminiService.ts
```

- [ ] **Step 3: Verify deletion**

Confirm file is deleted and no other files import from it.

---

## Task 2: Clean up PhotoDetailModal.tsx

**Files:**
- Modify: `components/PhotoDetailModal.tsx`

- [ ] **Step 1: Read current PhotoDetailModal.tsx**

Focus on lines 1-10 (imports), lines 26-30 (aiState), lines 115-128 (handleAnalyze), lines 313-352 (AI Vision UI).

- [ ] **Step 2: Remove AI-related imports**

Remove from imports section:
```typescript
// REMOVE this line if exists:
import { AIAnalysisState } from '../types';
// REMOVE this line if exists:
import { generateArtisticContext } from '../services/geminiService';
```

- [ ] **Step 3: Remove aiState state**

Remove lines 26-30:
```typescript
// REMOVE these lines:
const [aiState, setAiState] = useState<AIAnalysisState>({
  loading: false,
  content: null,
  error: null,
});
```

- [ ] **Step 4: Remove handleAnalyze function**

Remove lines 115-128 (approximately):
```typescript
// REMOVE these lines:
const handleAnalyze = useCallback(async () => {
  if (!displayPhoto) return;
  setAiState(prev => ({ ...prev, loading: true, error: null }));
  try {
    const context = await generateArtisticContext(displayPhoto);
    setAiState(prev => ({ ...prev, loading: false, content: context }));
  } catch (err) {
    setAiState(prev => ({ ...prev, loading: false, error: 'Analysis failed' }));
  }
}, [displayPhoto]);
```

- [ ] **Step 5: Remove AI Vision UI section**

Remove lines 313-352 (approximately) - the entire AI Vision section including Sparkles icon, "AI Vision" header, "Analyze Context" button, loading spinner, and content display.

- [ ] **Step 6: Verify dev server**

Check for any errors after changes.

---

## Task 3: Update types.ts

**Files:**
- Modify: `types.ts`

- [ ] **Step 1: Read types.ts**

Find AIAnalysisState interface (around lines 23-27) and AI modal fields in Translations type.

- [ ] **Step 2: Remove AIAnalysisState interface**

Remove:
```typescript
// REMOVE these lines:
export interface AIAnalysisState {
  loading: boolean;
  content: string | null;
  error: string | null;
}
```

- [ ] **Step 3: Remove AI-related translation fields**

In the `Translations` type's `modal` section, remove:
```typescript
aiVision: string,
analyze: string,
analyzing: string,
prompt: string,
```

---

## Task 4: Update constants.ts

**Files:**
- Modify: `constants.ts`

- [ ] **Step 1: Read constants.ts**

Find AI translation strings in TRANSLATIONS (lines 18 and 34).

- [ ] **Step 2: Remove AI translation strings from English**

Remove from `en` translation object:
```typescript
aiVision: 'AI Vision',
analyze: 'Analyze Context',
analyzing: 'Analyzing...',
prompt: 'Ask the AI to interpret...',
```

- [ ] **Step 3: Remove AI translation strings from Chinese**

Remove from `zh` translation object:
```typescript
aiVision: 'AI 视觉',
analyze: '解析意境',
analyzing: '分析中...',
prompt: '请求 AI 解读这幅作品的光影...',
```

---

## Task 5: Update vite.config.ts

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read vite.config.ts**

Find lines 14-15 with API_KEY mapping.

- [ ] **Step 2: Remove API_KEY environment mapping**

Remove:
```typescript
'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
```

---

## Task 6: Update .env.local

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Read .env.local**

- [ ] **Step 2: Remove GEMINI_API_KEY line**

Remove:
```
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

---

## Task 7: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Read package.json**

Find line 15 with @google/genai dependency.

- [ ] **Step 2: Remove @google/genai dependency**

Remove from dependencies:
```json
"@google/genai": "^1.30.0"
```

---

## Task 8: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Read CLAUDE.md**

Find references to AI, Gemini, @google/genai.

- [ ] **Step 2: Remove AI-related documentation**

Remove or update:
- Line about "Google Gemini API"
- Line about `@google/genai` dependency
- Any mentions of AI photo analysis

---

## Task 9: Final Verification

**Files:**
- Verify: All modified files

- [ ] **Step 1: Run dev server and verify no errors**

```bash
npm run dev
```

- [ ] **Step 2: Test photo modal opens correctly**

Verify the photo detail modal works without AI Vision.

- [ ] **Step 3: Verify no orphaned imports**

Search for any remaining references to `geminiService`, `generateArtisticContext`, `AIAnalysisState`.

---

## Spec Coverage Checklist

| Requirement | Task |
|-------------|------|
| Delete geminiService.ts | Task 1 |
| Remove AI code from PhotoDetailModal | Task 2 |
| Remove AIAnalysisState from types.ts | Task 3 |
| Remove AI translations from constants.ts | Task 4 |
| Remove API key mapping from vite.config.ts | Task 5 |
| Remove GEMINI_API_KEY from .env.local | Task 6 |
| Remove @google/genai from package.json | Task 7 |
| Update CLAUDE.md documentation | Task 8 |
| Final verification | Task 9 |

---

## Plan Complete

Saved to: `docs/superpowers/plans/2026-03-29-remove-ai-vision-plan.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?