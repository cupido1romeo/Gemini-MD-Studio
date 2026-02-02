## 2025-05-14 - Accessible Dropdown Menus and Icon Buttons
**Learning:** Icon-only buttons and custom dropdown menus require explicit ARIA attributes (`aria-label`, `role="menu"`, `role="menuitem"`, `aria-haspopup`, `aria-expanded`) to be accessible to screen reader users, as standard HTML tags alone don't convey their purpose or state.
**Action:** Always audit icon-only buttons for missing labels and ensures custom dropdowns follow the WAI-ARIA Menu pattern.

## 2025-05-14 - React Simple Code Editor Accessibility
**Learning:** In `react-simple-code-editor`, passing an `aria-label` as a prop applies it to the wrapping `div` rather than the internal `textarea`. This is still detected by some screen readers but may not be the optimal experience.
**Action:** Use a unique `textareaId` to facilitate programmatic access to the editor's textarea while keeping the label on the wrapper if that's where the component places it.
