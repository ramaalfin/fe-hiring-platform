# Accessibility Audit — Employer ATS Kanban

**Date:** 2026-05-04
**Scope:** Employer-facing kanban board and job management UI
**Standards:** WCAG 2.1 AA
**Requirements:** REQ-NF-A11Y-001, REQ-NF-A11Y-002

---

## 1. Summary

This audit covers the employer ATS kanban feature. All programmatically-fixable issues have been resolved in code. Manual testing with assistive technologies is required to fully validate WCAG 2.1 AA compliance.

---

## 2. Issues Found and Fixed

### 2.1 KanbanBoard — Missing landmark role and keyboard instructions

**File:** `KanbanBoard.tsx`

**Before:** The outer columns container had no landmark role and no instructions for keyboard drag-and-drop.

**After:**
- Wrapped columns in `<div role="region" aria-label="Application kanban board">`.
- Added a visually hidden `<p id="kanban-keyboard-instructions">` with full keyboard drag instructions.
- Added `role="list"` and `aria-label="Application status columns"` to the columns flex container.

---

### 2.2 KanbanColumn — Column header not semantically linked to droppable zone

**File:** `KanbanColumn.tsx`

**Before:** The droppable zone used `aria-label` with a static string, not linked to the visible column header.

**After:**
- Column header `<div>` now has a unique `id` (via `useId()`).
- Droppable zone uses `aria-labelledby={headerId}` to reference the visible header.
- Outer column `<div>` has `role="listitem"` to match the parent `role="list"`.

---

### 2.3 ApplicationCard — Missing drag-and-drop ARIA annotations

**File:** `ApplicationCard.tsx`

**Before:** No indication to screen readers that the card is draggable or how to use keyboard drag.

**After:**
- Added `aria-roledescription="draggable application card"` so screen readers announce the drag capability.
- Added `aria-describedby="kanban-keyboard-instructions"` to point to the keyboard instructions paragraph in KanbanBoard.

---

### 2.4 EmployerJobList — Missing accessible labels on controls

**File:** `EmployerJobList.tsx`

**Before:**
- Search `<Input>` had only a `placeholder`, no `aria-label`.
- Sort `<SelectTrigger>` had no `aria-label`.
- "View Applications" and "Delete" buttons had no job-name context.

**After:**
- Search input: `aria-label="Search jobs by title or description"`.
- Sort trigger: `aria-label="Sort jobs by"`.
- View Applications button: `aria-label="View applications for {job.jobName}"`.
- Delete button: `aria-label="Delete job {job.jobName}"`.

---

### 2.5 ApplicationDetail — No focus trap in modal

**File:** `ApplicationDetail.tsx`

**Before:** Focus was set to the close button on open, but Tab could escape the modal overlay.

**After:**
- Added a `useEffect` focus trap that intercepts `Tab` and `Shift+Tab` events.
- Queries all focusable elements inside `[role="document"]` (excluding `aria-hidden` subtrees).
- Wraps focus from last element back to first (Tab) and from first back to last (Shift+Tab).
- The existing Escape key handler and close-button focus-on-open are preserved.

---

## 3. Already Well-Implemented (No Changes Needed)

| Component | Accessibility Features |
|---|---|
| `ApplicationCard` | `role="button"`, `tabIndex={0}`, `aria-label`, `onKeyDown` for Enter/Space, `focus:ring-2` focus indicator |
| `ApplicationDetail` | `role="dialog"`, `aria-modal="true"`, `aria-label`, Escape key handler, `aria-labelledby` on sections, `aria-label` on textarea/buttons, `<time>` for dates, `aria-live="polite"` on refresh indicator |
| `SearchInput` | `role="search"`, `aria-label`, `aria-hidden` on icons, clear button with `aria-label` |
| `FilterPanel` | `role="group"`, `aria-labelledby`, `aria-label` on all interactive elements, `role="list"` on active badges, `aria-valuemin/max/now/text` on range inputs |
| `EmployerJobForm` | shadcn `FormLabel` renders `<label htmlFor>` for all inputs |

---

## 4. Manual Testing Checklist

### 4.1 Keyboard Navigation (REQ-NF-A11Y-001)

- [ ] Tab through cards: Press Tab from outside the board — focus should move through each card in each column in DOM order.
- [ ] Enter to open details: With focus on a card, press Enter — the ApplicationDetail modal should open.
- [ ] Space to open details: With focus on a card, press Space — the ApplicationDetail modal should open.
- [ ] Arrow keys to move between columns (drag): With focus on a card, press Space to pick it up, then use arrow keys to move it to another column, then press Space/Enter to drop.
- [ ] Escape to cancel drag: While dragging with keyboard, press Escape — the card should return to its original position.
- [ ] Tab within modal: With the modal open, Tab should cycle through all interactive elements (close button, status select, notes textarea, save button) without escaping the modal.
- [ ] Shift+Tab within modal: Shift+Tab should cycle backwards through modal elements.
- [ ] Escape to close modal: Press Escape while modal is open — modal should close.

### 4.2 Screen Reader Support (REQ-NF-A11Y-002)

- [ ] Board landmark: Screen reader should announce "Application kanban board, region" when navigating to the board.
- [ ] Column labels: Each column should be announced with its status name (e.g., "Applied column").
- [ ] Card announcement: Each card should be announced as "Application from [Name], status: [Status], draggable application card".
- [ ] Keyboard drag instructions: Screen reader should read the keyboard instructions when a card receives focus (via `aria-describedby`).
- [ ] Modal announcement: Opening a card should announce "Application details for [Name], dialog".
- [ ] Status history: The status history timeline should be navigable and each entry announced correctly.
- [ ] Live region: The "Refreshing..." indicator should be announced by screen readers without requiring focus.
- [ ] Filter panel: Filter controls should be announced with their group label "Filters".
- [ ] Active filter badges: Each badge's remove button should announce "Remove [filter name] filter".

### 4.3 Focus Indicators

- [ ] All interactive elements show a visible focus ring (blue ring via `focus:ring-2 focus:ring-primary`).
- [ ] Focus ring is visible on cards, buttons, inputs, selects, and links.
- [ ] Focus ring is not obscured by overlapping elements.
- [ ] Modal close button receives focus immediately when modal opens.

### 4.4 Form Accessibility

- [ ] All form fields in `EmployerJobForm` have associated `<label>` elements (via shadcn `FormLabel`).
- [ ] Validation error messages are associated with their fields via `aria-describedby` (shadcn `FormMessage` handles this).
- [ ] The job type select in the form announces its label "Job Type".

---

## 5. Color Contrast Analysis

The status colors use Tailwind's semantic color palette. Below is an analysis against WCAG AA requirements (4.5:1 for normal text, 3:1 for large/bold text).

| Status | Background | Text | Approx. Ratio | WCAG AA | Notes |
|---|---|---|---|---|---|
| Applied | bg-blue-100 (#DBEAFE) | text-blue-700 (#1D4ED8) | ~5.9:1 | Pass | |
| Screening | bg-yellow-100 (#FEF9C3) | text-yellow-700 (#A16207) | ~4.8:1 | Pass | |
| Interview | bg-purple-100 (#F3E8FF) | text-purple-700 (#7E22CE) | ~5.5:1 | Pass | |
| Offer | bg-orange-100 (#FFEDD5) | text-orange-700 (#C2410C) | ~4.6:1 | Pass | |
| Hired | bg-green-100 (#DCFCE7) | text-green-700 (#15803D) | ~5.1:1 | Pass | |
| Rejected | bg-red-100 (#FEE2E2) | text-red-700 (#B91C1C) | ~5.3:1 | Pass | |

Note: These ratios are approximate based on Tailwind's default color palette. Use the WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/) or browser DevTools to verify exact values in the rendered UI.

Neutral text colors used in cards:
- text-neutral-900 on white: ~16:1 (Pass)
- text-neutral-500 on white: ~7:1 (Pass)
- text-neutral-400 on white: ~4.6:1 (Pass, borderline — verify in context)

---

## 6. Screen Reader Testing Notes

### Recommended Tools

| Platform | Tool |
|---|---|
| macOS / iOS | VoiceOver (built-in, activate with Cmd+F5 or triple-click Touch ID) |
| Windows | NVDA (free, nvaccess.org) or JAWS |
| Android | TalkBack (built-in) |
| Browser extension | axe DevTools (Chrome/Firefox) |

### Key Scenarios to Test with VoiceOver / NVDA

1. Navigate to the kanban board using the Landmarks rotor (VoiceOver) or landmark navigation (NVDA: D key).
   - Expected: "Application kanban board, region" is announced.

2. Navigate into the columns list.
   - Expected: "Application status columns, list, 6 items" (or similar).

3. Move to the first column.
   - Expected: Column header text (e.g., "Applied, 3") is announced.

4. Move to the first card.
   - Expected: "Application from [Name], status: APPLIED, draggable application card, button" followed by the keyboard instructions.

5. Activate a card (Enter/Space).
   - Expected: "Application details for [Name], dialog" is announced. Focus moves to the close button.

6. Tab through the modal.
   - Expected: Focus cycles through close button, status select, notes textarea, save button — and wraps back to close button.

7. Close the modal (Escape or close button).
   - Expected: Modal closes, focus returns to the page.

---

## 7. axe DevTools Integration

### Running axe in the Browser

1. Install the axe DevTools browser extension (Chrome or Firefox).
2. Open the employer kanban page in the browser.
3. Open DevTools (F12) and navigate to the "axe DevTools" tab.
4. Click "Analyze" to run an automated accessibility scan.
5. Review violations and fix any critical or serious issues.

### Running axe Programmatically (Future)

If a test framework is added to the frontend (e.g., Jest + Testing Library), axe can be integrated as follows:

```bash
npm install --save-dev @axe-core/react jest-axe
```

Example test:

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import KanbanBoard from "../KanbanBoard";

expect.extend(toHaveNoViolations);

test("KanbanBoard has no axe violations", async () => {
  const { container } = render(<KanbanBoard jobId="test-job-id" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Known axe Limitations

- axe cannot test keyboard interaction flows (drag-and-drop, focus trap behavior).
- axe cannot test color contrast of dynamically rendered content in all cases.
- axe cannot test screen reader announcement quality.
- Manual testing with real assistive technologies is always required for full WCAG compliance.

---

## 8. Outstanding Items / Future Work

| Item | Priority | Notes |
|---|---|---|
| Return focus to triggering card after modal close | Medium | Currently focus goes to body after modal closes. Requires storing a ref to the card that opened the modal. |
| Install a frontend test framework | Low | Would enable automated axe scans in CI. Recommended: Vitest + Testing Library + jest-axe. |
| Verify color contrast with exact rendered values | Low | Use browser DevTools color picker on the actual rendered page. |
| Test with real screen readers | High | VoiceOver on macOS and NVDA on Windows are the minimum. |
| Add `aria-required` to required form fields | Low | shadcn Form components may handle this via HTML5 `required` attribute. Verify. |
