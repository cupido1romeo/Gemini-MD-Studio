## 2024-07-25 - A11y Pattern: Icon-Only Button Labeling

**Learning:** The codebase frequently uses `lucide-react` to create icon-only buttons. I've noticed a recurring accessibility issue where these buttons are labeled with the `title` attribute, which provides a weak tooltip but is not a robust solution for screen readers. The `aria-label` attribute is the correct, modern approach for providing an accessible name to these controls.

**Action:** When I encounter an icon-only button, I will proactively check for the presence of an `aria-label`. If it's missing or if a `title` attribute is used instead, I will replace it with `aria-label` to ensure the control is properly accessible to all users.
