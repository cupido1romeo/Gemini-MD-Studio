## 2025-05-22 - Accessibility Polish for Toolbars
**Learning:** Icon-only buttons in this repository consistently use the 'title' attribute but lack 'aria-label', making them inaccessible to screen readers. Additionally, custom dropdown menus often lack keyboard support (Escape key) and proper ARIA roles (menu/menuitem).
**Action:** Always add 'aria-label' alongside 'title' for icon-only buttons. Ensure dropdowns have 'role="menu"', 'aria-haspopup', 'aria-expanded', and a keydown listener for the 'Escape' key.
