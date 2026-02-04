## 2026-02-04 - [Accessible Dropdowns]
**Learning:** Dropdown menus in this app (like AI Assist) were missing critical ARIA attributes for screen readers and did not support standard keyboard dismissal via the Escape key.
**Action:** Always apply `role="menu"` and `role="menuitem"` to dropdown components, along with `aria-haspopup` and `aria-expanded` on the trigger. Implement a keyboard listener for the 'Escape' key to ensure standard accessible behavior.
