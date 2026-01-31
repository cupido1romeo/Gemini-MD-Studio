## 2025-05-15 - Accessibility Polish for Core Toolbar Actions
**Learning:** Icon-only buttons with tooltips (`title`) are common but inaccessible to screen readers. Adding `aria-label` that matches or enhances the tooltip provides a better experience. Additionally, using `aria-live="polite"` for status indicators (like save status) ensures users are informed of background changes.
**Action:** Always check for icon-only buttons and add `aria-label`. For shortcut-enabled buttons, include the shortcut in the `aria-label` if possible. Use `aria-live` for dynamic status text.
