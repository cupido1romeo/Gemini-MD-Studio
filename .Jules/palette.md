## 2026-02-05 - Custom Dropdown and Notification Accessibility
**Learning:** Custom dropdown menus (like the AI Assist menu) require manual ARIA state management (aria-expanded, aria-haspopup) and keyboard listeners (Escape key) to meet accessibility standards. Similarly, dynamic notification toasts need role="status" and aria-live="polite" to be announced by screen readers without interrupting flow.
**Action:** Always verify that interactive elements triggered by buttons have corresponding ARIA roles and that custom menus support keyboard dismissal.
