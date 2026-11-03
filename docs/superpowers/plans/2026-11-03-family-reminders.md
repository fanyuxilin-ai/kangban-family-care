# 家庭提醒中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add member-associated custom health reminders and show them together with prescription-derived medication reminders on the family home screen.

**Architecture:** Keep existing medication/OCR state and medication manager intact. Add a separate custom-reminder and completion-log model, then unify both kinds in the home renderer and a reminder-management modal. Store measurement completions locally as health measurement history.

**Tech Stack:** Vanilla JavaScript, HTML, CSS, localStorage.

**Spec:** `docs/superpowers/specs/2026-11-03-family-reminders-design.md`

## Global Constraints
- Do not change `main` or the collaborator's feature branch.
- Preserve existing medication OCR review, medication plan storage, and taken-state behavior.
- Keep this prototype's data in the current browser; no service worker/background push or cloud sync changes.
- Never infer medication schedules or medical thresholds.

## Review Focus
- Existing browser state has no custom-reminder fields: loading must default safely without dropping existing data.
- An inactive weekday/end date must not render or complete a reminder occurrence.
- Measurement fields must be required and must remain tied to the selected reminder/member.
- Deleting a reminder must not delete the prescription medication list.
- Text entered by the user must be escaped before rendering into HTML.

---

### Task 1: Add reminder data and family-home workflows

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`
- Create: `docs/superpowers/specs/2026-11-03-family-reminders-design.md`

**Implementation:**
- Extend state loading with `customReminders`, per-occurrence `reminderLogs`, and `measurementRecords`, preserving existing state.
- Render medication and custom items together in today's home list, honoring member, selected weekdays, and end date.
- Add create/manage flows for measurement, activity, and free-form reminders, with one daily time, weekday recurrence, optional end date, and delete action.
- Completing a measurement asks for the reading (systolic/diastolic for blood pressure, one value for glucose/custom metric) and optional note; completing activity/custom items records status and optional note.
- Keep medication completion and OCR entry as their existing flows; add links to them from the reminder center.
- Use responsive styles consistent with existing card/modal patterns; retain clear local-data and non-medical-disclaimer copy.

**Manual verification:**
- Open the app with existing localStorage and confirm the current medication list and other app state remain visible.
- Create a blood-pressure reminder for the seeded member, select weekdays and an end date, then confirm it appears on a matching day.
- Record a blood-pressure reading and a glucose reading; confirm both persist after reload in reminder history.
- Create and complete a walking reminder; confirm the state is distinct from medication completion.
- Delete a custom reminder and confirm existing medication reminders remain.
