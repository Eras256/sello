# SELLO Design System

> Premium dark-mode institutional aesthetic with glassmorphism.
> All values extracted from `apps/web/src/app/globals.css`.

---

## Color Palette

### Backgrounds

| Token                  | Value                     | Usage                                    |
|------------------------|---------------------------|------------------------------------------|
| `--bg-primary`         | `#0a0b0f`                 | Page background, `<body>`                |
| `--bg-secondary`       | `#12141a`                 | Alternate sections, code blocks, inputs  |
| `--bg-tertiary`        | `#1a1c24`                 | Inactive tier dots, scrollbar thumb      |
| `--bg-card`            | `rgba(255,255,255,0.03)`  | Glass cards, stats bar, step cards       |
| `--bg-card-hover`      | `rgba(255,255,255,0.06)`  | Card hover state                         |
| `--bg-glass`           | `rgba(18,20,26,0.8)`      | Navbar backdrop                          |

### Accents

| Token                  | Value                     | Usage                                    |
|------------------------|---------------------------|------------------------------------------|
| `--accent`             | `#6366f1`                 | Primary brand (indigo), links hover      |
| `--accent-light`       | `#818cf8`                 | Link text, stat values, code keywords    |
| `--accent-dark`        | `#4f46e5`                 | Deeper accent variant                    |
| `--accent-glow`        | `rgba(99,102,241,0.15)`   | Glow shadows, badge/button backgrounds   |
| `--accent-glow-strong` | `rgba(99,102,241,0.3)`    | Strong glow on hover, animation peak     |
| `--accent-secondary`   | `#8b5cf6`                 | Gradient endpoint, tier-4 dot            |

### Text

| Token                  | Value                     | Usage                                    |
|------------------------|---------------------------|------------------------------------------|
| `--text-primary`       | `#f1f5f9`                 | Headings, body text, nav logo            |
| `--text-secondary`     | `#94a3b8`                 | Subtitles, descriptions, nav links       |
| `--text-tertiary`      | `#64748b`                 | Footer text, stat labels                 |
| `--text-muted`         | `#475569`                 | Placeholders, step arrows, code comments |

### Semantic

| Token                  | Value                     | Usage                                    |
|------------------------|---------------------------|------------------------------------------|
| `--success`            | `#22c55e`                 | Verified states, pricing checkmarks      |
| `--success-glow`       | `rgba(34,197,94,0.15)`    | Success badge background                 |
| `--warning`            | `#f59e0b`                 | Warning states, tier-3 dots              |
| `--warning-glow`       | `rgba(245,158,11,0.15)`   | Warning badge background                 |
| `--error`              | `#ef4444`                 | Error states, problem list markers       |
| `--error-glow`         | `rgba(239,68,68,0.15)`    | Error badge background                   |

### Borders

| Token                  | Value                     | Usage                                    |
|------------------------|---------------------------|------------------------------------------|
| `--border`             | `rgba(255,255,255,0.06)`  | Card borders, section dividers, inputs   |
| `--border-hover`       | `rgba(255,255,255,0.12)`  | Hover border state                       |
| `--border-accent`      | `rgba(99,102,241,0.3)`    | Wallet button border, accent borders     |

---

## Typography

### Font Stack

| Token    | Value                                                    |
|----------|----------------------------------------------------------|
| `--font` | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` |

Code blocks use: `'JetBrains Mono', 'Fira Code', monospace`

### Type Scale

| Element            | Size       | Weight | Line-Height | Extra                             |
|--------------------|------------|--------|-------------|-----------------------------------|
| `.hero-title`      | `4rem`     | 900    | 1.1         | Gradient text, animated           |
| `.section-title`   | `2.25rem`  | 800    | —           | Gradient clip text                |
| `.hero-subtitle`   | `1.25rem`  | —      | 1.7         | `--text-secondary`                |
| `.section-subtitle`| `1.125rem` | —      | —           | `--text-secondary`, max 640px     |
| `.pricing-price`   | `2.5rem`   | 800    | —           | `.pricing-price span`: 1rem / 400 |
| `.pricing-name`    | `1.125rem` | 600    | —           |                                   |
| `.stat-value`      | `2rem`     | 800    | —           | `--accent-light`                  |
| `.navbar-logo`     | `1.5rem`   | 800    | —           | Flex with dot indicator           |
| Body               | `16px`     | —      | 1.6         | `--text-primary`                  |
| `.btn`             | `0.9375rem`| 600    | 1           |                                   |
| `.navbar-links a`  | `0.9375rem`| 500    | —           |                                   |
| `.badge`           | `0.75rem`  | 600    | —           | `letter-spacing: 0.02em`          |
| `.footer-col h4`   | `0.875rem` | 600    | —           | `text-transform: uppercase`, `letter-spacing: 0.05em` |
| `.footer-col a`    | `0.875rem` | —      | —           |                                   |
| `.code-block`      | `0.875rem` | —      | 1.7         | Monospace font                    |
| `.stat-label`      | `0.8125rem`| —      | —           |                                   |
| `.wallet-btn`      | `0.875rem` | 600    | —           |                                   |

### Responsive Overrides

| Breakpoint   | `.hero-title` | `.section-title` | `.hero-subtitle` |
|--------------|---------------|-------------------|------------------|
| `≤ 768px`    | `2.5rem`      | `1.75rem`         | `1rem`           |

---

## Spacing & Layout

| Token / Rule         | Value                 | Usage                                      |
|----------------------|-----------------------|--------------------------------------------|
| `--navbar-height`    | `72px`                | Navbar height, hero calc, mobile menu top   |
| `.container`         | `max-width: 1200px`   | Content wrapper, `padding: 0 24px`          |
| `.section`           | `padding: 80px 0`     | Vertical section spacing (48px on mobile)   |
| `.stats-bar`         | `padding: 32px`       | Stats section, `gap: 48px`                  |
| `.footer`            | `padding: 48px 0 24px`| Footer vertical spacing                     |
| `.footer-grid`       | `gap: 48px`           | Footer columns (32px on tablet, 1col mobile)|
| Grid gaps            | `24px`                | `.grid-2`, `.grid-3`, `.grid-4`             |
| `.step-flow`         | `gap: 16px`           | Between step cards                          |
| `.pricing-card`      | `padding: 32px`       | Inner pricing card spacing                  |
| `.glass-card`        | (no padding)          | Applied inline per usage (`24px`–`32px`)    |
| `.code-block`        | `padding: 20px 24px`  | Code block inner spacing                    |
| Button padding       | `12px 24px`           | `.btn` base                                 |
| Wallet button        | `10px 20px`           | `.wallet-btn`                               |
| Badge padding        | `4px 10px`            | `.badge`                                    |
| Input padding        | `12px 16px`           | `.input`                                    |

### Container on Mobile

| Breakpoint   | Container Padding |
|--------------|-------------------|
| `≤ 480px`    | `0 16px`          |

---

## Border Radius

| Token          | Value  | Usage                                          |
|----------------|--------|-------------------------------------------------|
| `--radius-sm`  | `8px`  | Small elements                                  |
| `--radius-md`  | `12px` | Buttons, inputs, code blocks                    |
| `--radius-lg`  | `16px` | Glass cards, pricing cards, step cards           |
| `--radius-xl`  | `24px` | Large containers                                |
| Badges         | `999px`| Fully rounded pill shape                        |
| Tier dots      | `50%`  | Circles (8×8px)                                 |
| Step number    | `50%`  | Circles (40×40px)                               |
| Logo dot       | `50%`  | Circle (8×8px)                                  |
| Scrollbar      | `4px`  | Scrollbar thumb                                 |

---

## Shadows

| Token           | Value                              | Usage                                 |
|-----------------|------------------------------------|---------------------------------------|
| `--shadow-sm`   | `0 1px 2px rgba(0,0,0,0.3)`       | Subtle elevation                      |
| `--shadow-md`   | `0 4px 12px rgba(0,0,0,0.4)`      | Medium elevation                      |
| `--shadow-lg`   | `0 8px 32px rgba(0,0,0,0.5)`      | Pricing card hover                    |
| `--shadow-glow` | `0 0 20px var(--accent-glow)`     | Glass card hover, featured pricing    |
| `btn-primary`   | `0 0 24px var(--accent-glow-strong)` | Primary button hover               |
| `input:focus`   | `0 0 0 3px var(--accent-glow)`    | Focus ring                            |
| `tier-dot`      | `0 0 8px var(--accent-glow)`      | Active tier dot glow                  |

---

## Transitions

| Token                | Value             | Usage                                   |
|----------------------|-------------------|-----------------------------------------|
| `--transition`       | `all 0.2s ease`   | Default: cards, buttons, links, inputs  |
| `--transition-slow`  | `all 0.4s ease`   | Slower animations                       |

---

## Animations

| Name          | Duration / Timing            | CSS Class             | Usage                    |
|---------------|------------------------------|-----------------------|--------------------------|
| `fadeInUp`    | `0.6s ease forwards`         | `.animate-fadeInUp`   | Element entrance         |
| `pulse`       | `2s ease-in-out infinite`    | `.animate-pulse`      | Attention indicator      |
| `glow`        | `3s ease-in-out infinite`    | `.animate-glow`       | Glowing element          |
| `gradient`    | `6s linear infinite`         | (inline on hero-title)| Hero title shimmer       |

### Keyframes Detail

- **fadeInUp**: `opacity 0→1`, `translateY(20px→0)`
- **pulse**: `opacity 1→0.5→1`
- **glow**: `box-shadow 20px→40px→20px` using accent glow
- **gradient**: `background-position 0%→100%→0%` (200% background-size)

---

## Component Classes

### `.glass-card`
Glassmorphism container with `backdrop-filter: blur(20px)`, transparent background, border. Hover lifts with glow shadow. **Does not include padding** — apply inline.

### `.btn` Variants

| Class            | Background                                              | Text              | Hover Effect                         |
|------------------|---------------------------------------------------------|-------------------|--------------------------------------|
| `.btn-primary`   | `linear-gradient(135deg, --accent, --accent-secondary)` | `white`           | Glow shadow + translateY(-1px)       |
| `.btn-secondary` | `transparent`, 1px border                               | `--text-primary`  | Accent border + accent glow bg       |
| `.btn-ghost`     | `transparent`                                           | `--text-secondary`| Text lightens + card bg              |

### `.badge` Variants

| Class           | Background           | Text Color          | Border Color              |
|-----------------|----------------------|---------------------|---------------------------|
| `.badge-success`| `--success-glow`     | `--success`         | `rgba(34,197,94,0.2)`     |
| `.badge-warning`| `--warning-glow`     | `--warning`         | `rgba(245,158,11,0.2)`    |
| `.badge-error`  | `--error-glow`       | `--error`           | `rgba(239,68,68,0.2)`     |
| `.badge-accent` | `--accent-glow`      | `--accent-light`    | `rgba(99,102,241,0.2)`    |

### `.pricing-card`
Card with padding 32px, border, hover lifts 4px with `--shadow-lg`. `.featured` variant has accent border and gradient top-glow background.

### `.tier-dot` / `.tier-indicator`
Row of 8×8px circular dots. `.active` adds colored background + glow:
- `.tier-1.active` → `--success` (green)
- `.tier-2.active` → `--accent` (indigo)
- `.tier-3.active` → `--warning` (amber)
- `.tier-4.active` → `--accent-secondary` (violet)

### `.step-card` / `.step-flow`
Horizontal flow with arrow separators. Cards have centered text, step number circles (40×40px, indigo glow). Arrows hidden on mobile.

### `.wallet-btn`
Accent glow background with accent border. Hover fills solid accent. Contains optional `.address` child (monospace, 0.8125rem).

### `.code-block`
Dark code container with syntax highlighting classes:
- `.code-keyword` → `--accent-light`
- `.code-string` → `--success`
- `.code-comment` → `--text-muted` (italic)
- `.code-function` → `#fbbf24` (amber)

### `.input`
Full-width input with secondary background. Focus adds accent border + 3px glow ring.

---

## Grid System

| Class      | Columns     | Gap    |
|------------|-------------|--------|
| `.grid-2`  | `repeat(2)` | `24px` |
| `.grid-3`  | `repeat(3)` | `24px` |
| `.grid-4`  | `repeat(4)` | `24px` |

---

## Responsive Breakpoints

| Breakpoint   | Grid Changes                           | Other Changes                          |
|--------------|----------------------------------------|----------------------------------------|
| `≤ 1024px`   | `.grid-3`, `.grid-4` → 2 columns      | —                                      |
| `≤ 768px`    | All grids → 1 column                  | Section padding → 48px, section-title → 1.75rem, hero-title → 2.5rem, nav links hidden (mobile menu), step arrows hidden, footer grid → 2 cols |
| `≤ 480px`    | —                                      | Container padding → 16px, footer grid → 1 col |

---

## Accessibility

- **Focus rings**: `.input:focus` applies `border-color: var(--accent)` + `box-shadow: 0 0 0 3px var(--accent-glow)`
- **Transitions**: All interactive elements use `var(--transition)` (0.2s ease)
- **Aria labels**: Mobile menu toggle has `aria-label="Toggle navigation menu"`
- **All interactive elements** must have unique `id` attributes (for e2e testing)
- **External links** use `target="_blank" rel="noopener noreferrer"`
- **Font smoothing**: `-webkit-font-smoothing: antialiased` on `<html>`
- **Scroll behavior**: `scroll-behavior: smooth` on `<html>`
- **Scrollbar**: Custom webkit scrollbar (8px, matches theme)

---

## Layout Structure

```
<html lang="en" suppressHydrationWarning>
  <body>
    <nav class="navbar" id="main-nav">         ← Sticky, z-100, glass backdrop
      <div class="navbar-inner">               ← max-width 1200px container
        <a class="navbar-logo">SELLO<span class="dot"></span></a>
        <ul class="navbar-links">              ← Hidden on mobile
        <button class="wallet-btn">
        <button class="mobile-menu-btn">       ← Visible on mobile only
      </div>
    </nav>
    <main>{children}</main>
    <footer class="footer" id="site-footer">
      <div class="container">
        <div class="footer-grid">              ← 2fr 1fr 1fr 1fr
        <div>© 2026 SELLO Protocol</div>
      </div>
    </footer>
  </body>
</html>
```

### Navigation Pages

| Route        | Page              |
|--------------|-------------------|
| `/`          | Home (hero + CTA) |
| `/verify`    | Verification flow |
| `/explorer`  | Attestation explorer |
| `/dashboard` | User dashboard    |
| `/docs`      | Documentation     |
| `/pricing`   | Pricing plans     |
