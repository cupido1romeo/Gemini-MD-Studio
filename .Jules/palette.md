## 2024-07-25 - The Power of a Good Label

**Learning:** I discovered that several icon-only buttons in `Toolbar.tsx` were missing `aria-label` attributes. While they had `title` attributes for visual tooltips on hover, this is insufficient for screen reader users, who rely on `aria-label` to understand the button's function.

**Action:** For any icon-only button, I will always ensure it has both a `title` (for mouse users) and a descriptive `aria-label` (for screen reader users) to provide a complete and accessible experience.
