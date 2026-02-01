## 2025-01-24 - Accessibility and Safety Polish

**Learning:** Interactive elements without explicit ARIA labels are invisible to screen readers, especially icon-only buttons. Additionally, destructive actions like clearing an editor without a confirmation prompt can lead to significant user frustration and accidental data loss.

**Action:** Always ensure icon-only buttons have an `aria-label` that describes their action, and use `aria-pressed` for toggle buttons. Implement confirmation dialogs for destructive actions that affect user-generated content.
