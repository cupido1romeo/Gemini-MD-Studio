## 2024-07-25 - Icon Button Accessibility

**Learning:** This codebase frequently uses the `title` attribute to provide tooltips for icon-only buttons, as seen in `components/Toolbar.tsx`. While this provides a visual tooltip on hover, it's not reliably announced by all screen readers, creating an accessibility gap.

**Action:** I will replace the `title` attributes with `aria-label` for all icon-only buttons. This ensures that screen reader users get a clear, audible description of the button's function, improving the overall accessibility of the UI. This will be a recurring pattern to look for in this application.
