# Design System Inspired by carigas.my

> Auto-extracted from `https://carigas.my/ms` on 2026-06-20

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "Kedai gas berhampiran anda".

**Key Characteristics:**

- JetBrains Mono as the heading font (custom web font loaded via @font-face)
- JetBrains Mono as the body font for all running text
- Heading weight 900, letter-spacing -1.44px
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#0078a8` used for CTAs and brand highlights
- 4 shadow level(s) detected — standard shadows
- Rounded corners (70px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, compact, monospace, sans-serif

## 2. Color Palette & Roles

### Primary

- **Primary Accent** (`#0078a8`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.

### Text

- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces

- **Border** (`#dddddd`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| #   | Hex       | CSS Variable  | Role        | Area  | Contrast   |
| --- | --------- | ------------- | ----------- | ----- | ---------- |
| 1   | `#dddddd` | `--palette-1` | section     | large | text-dark  |
| 2   | `#ffffff` | `--palette-2` | badge       | small | text-dark  |
| 3   | `#0078a8` | `--palette-3` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `JetBrains Mono` (web font)
- **Body Font:** `JetBrains Mono` (web font)

### Type Hierarchy

| Role  | Font           | Size | Weight | Line Height | Letter Spacing |
| ----- | -------------- | ---- | ------ | ----------- | -------------- |
| H1    | JetBrains Mono | 24px | 900    | 32px        | -1.44px        |
| H2    | JetBrains Mono | 16px | 900    | 24px        | -0.64px        |
| Body  | JetBrains Mono | 12px | 600    | 16px        | 2.16px         |
| Small | JetBrains Mono | 14px | 900    | 20px        | normal         |
| Code  | JetBrains Mono | 16px | 400    | 24px        | normal         |

### Type Scale

| Token   | Size     | Suggested Usage        |
| ------- | -------- | ---------------------- |
| Display | `24px`   | headings               |
| H1      | `22px`   | headings               |
| H2      | `20px`   | headings               |
| H3      | `18px`   | headings               |
| H4      | `16px`   | headings               |
| Body L  | `14px`   | body / supporting text |
| Body    | `13px`   | body / supporting text |
| Small   | `12px`   | body / supporting text |
| XS      | `10.4px` | body / supporting text |
| Caption | `9.6px`  | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: #ffffff;
  color: #000000;
  border-radius: 2px;
  padding: 0px 0px;
  font-size: 22px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #ffffff;
  color: #000000;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 22px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Card

```css
.card {
  background:;
  border-radius: 0px;
  padding: 12px;
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.1) 0px 1px 2px -1px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `2.4px` — use multiples (4.8px, 7.199999999999999px, 9.6px, etc.)

### Spacing Scale (extracted from real elements)

| Token     | Value   | Role    |
| --------- | ------- | ------- |
| spacing-1 | `2.4px` | element |
| spacing-2 | `10px`  | element |
| spacing-3 | `12px`  | element |
| spacing-4 | `16px`  | element |
| spacing-5 | `4px`   | element |
| spacing-6 | `8px`   | element |
| spacing-7 | `20px`  | element |

### Border Radius Scale

| Token         | Value  | Element |
| ------------- | ------ | ------- |
| radius-card   | `70px` | card    |
| radius-subtle | `2px`  | subtle  |
| radius-subtle | `4px`  | subtle  |
| radius-button | `8px`  | button  |

## 6. Depth & Elevation

| Level | Shadow                                                                                | Usage                     |
| ----- | ------------------------------------------------------------------------------------- | ------------------------- |
| Low   | `lab(9.03835 1.15298 1.92955) 0px 0px 0px 2px, lab(98.2686 -0.0991821 0.364304) 0...` | Cards, subtle elevation   |
| Low   | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation   |
| Low   | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation   |
| High  | `rgba(0, 0, 0, 0.4) 0px 8px 24px 0px, rgba(255, 255, 255, 0.1) 0px 0px 1px 0px`       | Modals, floating elements |

## 7. Do's and Don'ts

### Do

- Use `#ffffff` as the primary background color
- Use `JetBrains Mono` for all headings and `JetBrains Mono` for body text
- Use `#0078a8` as the single dominant accent/CTA color
- Maintain `2.4px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`70px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 900 for headings to match the brand's typographic voice

### Don't

- Don't use colors outside the extracted palette without justification
- Don't substitute JetBrains Mono/JetBrains Mono with generic alternatives
- Don't use irregular spacing — stick to 2.4px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width       | Notes                                                 |
| ---------- | ----------- | ----------------------------------------------------- |
| Mobile     | < 640px     | Single column, stack sections, reduce font sizes ~80% |
| Tablet     | 640–1024px  | 2-column where appropriate, maintain spacing ratios   |
| Desktop    | 1024–1440px | Full layout as designed                               |
| Wide       | > 1440px    | Max-width container, center content                   |

- Touch targets: minimum 44×44px on mobile
- Maintain 2.4px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #0078a8
Border:      #dddddd
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `JetBrains Mono` heading in `#000000`, and a `#0078a8` CTA button with 2px radius."
2. "Create a pricing card using background `#ffffff`, border `#dddddd`, `JetBrains Mono` for text, and 7.199999999999999px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#0078a8` for active state."
4. "Build a feature grid with 3 columns, 7.199999999999999px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 4.8px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 32 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable                       | Value      |
| ------------------------------ | ---------- |
| `--background`                 | `#fff`     |
| `--foreground`                 | `#0c0a09`  |
| `--card`                       | `#fff`     |
| `--card-foreground`            | `#0c0a09`  |
| `--popover`                    | `#fff`     |
| `--popover-foreground`         | `#0c0a09`  |
| `--primary`                    | `#c53c00`  |
| `--primary-foreground`         | `#fff7ed`  |
| `--secondary`                  | `#f4f4f5`  |
| `--secondary-foreground`       | `#18181b`  |
| `--muted`                      | `#f5f5f4`  |
| `--muted-foreground`           | `#79716b`  |
| `--accent`                     | `#f5f5f4`  |
| `--accent-foreground`          | `#1c1917`  |
| `--destructive`                | `#e40014`  |
| `--border`                     | `#e7e5e4`  |
| `--input`                      | `#e7e5e4`  |
| `--ring`                       | `#a6a09b`  |
| `--chart-1`                    | `#ffb96d`  |
| `--chart-2`                    | `#fe6e00`  |
| `--chart-3`                    | `#f05100`  |
| `--chart-4`                    | `#c53c00`  |
| `--chart-5`                    | `#9f2d00`  |
| `--sidebar`                    | `#fafaf9`  |
| `--sidebar-foreground`         | `#0c0a09`  |
| `--sidebar-primary`            | `#f05100`  |
| `--sidebar-primary-foreground` | `#fff7ed`  |
| `--sidebar-accent`             | `#f5f5f4`  |
| `--sidebar-accent-foreground`  | `#1c1917`  |
| `--sidebar-border`             | `#e7e5e4`  |
| ...                            | _(1 more)_ |

### Spacing Variables

| Variable   | Value     |
| ---------- | --------- |
| `--radius` | `.625rem` |
