---
name: Nexum Payroll DO
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006c4a'
  on-tertiary: '#ffffff'
  tertiary-container: '#3eb686'
  on-tertiary-container: '#00422c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  body-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-currency-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  label-currency-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-currency-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-tag:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets enterprise payroll administrators, HR directors, and financial controllers operating within the regulatory framework of the Dominican Republic (TSS, DGII, Infotep, and Ministerio de Trabajo). The aesthetic balances institutional rigor with contemporary SaaS agility: high information density, rapid scanning ergonomics, and absolute clarity during high-stakes batch processing.

The style unites **Corporate Precision** with **Data-Dense Modernism**:
- **Tone:** Authoritative, disciplined, transparent, and resilient.
- **Visual Weight:** Ultra-crisp architectural lines, subtle slate boundaries, and high-contrast numerical hierarchies that eliminate cognitive fatigue during complex payroll runs.
- **Atmosphere:** Deep navy surfaces anchor global navigation and control panes, while luminous emerald call-to-actions signal affirmative processing states (approvals, disbursements, and batch calculations).

## Colors

The color system delivers high legibility across dense enterprise tables and calculation panels, maintaining WCAG AAA compliance for financial figures and statuses.

- **Primary Action (Emerald Green `#10B981` / Active `#059669`):** Reserved strictly for affirmative transactional tasks (Calculate Payroll, Approve TSS Batch, Execute Wire Disbursement, Export DGII IR-3).
- **Navigation & Structural Depth (Slate Navy `#0F172A` / `#1E293B`):** Anchors global sidebars, critical header bars, and top-level payroll state headers.
- **Canvas & Surface Tiering:**
  - Base Background: `#F8FAFC` (Slate 50)
  - Surface Containers / Cards: `#FFFFFF`
  - Subtle Borders & Dividers: `#E2E8F0` (Slate 200) for light mode, `#334155` (Slate 700) for dark mode
  - Inset Table Stripping / Read-Only Fields: `#F1F5F9` (Slate 100)
- **Status & Compliance Semantics (Icon + Text pairing mandatory):**
  - **Success (Processed / Paid):** `#059669` text on `#ECFDF5` background
  - **Warning (TSS Discrepancy / Overtime Alert):** `#D97706` text on `#FFFBEB` background
  - **Critical (DGII Retention Hold / Negative Balance):** `#DC2626` text on `#FEF2F2` background
  - **Draft / In-Review:** `#475569` text on `#F1F5F9` background

## Typography

Typography enforces absolute distinction between narrative interface labels and computed monetary/tax metrics:

- **Primary Interface (`Inter`):** Handles UI chrome, field descriptors, table cell text, and form inputs. Optimized for high readability at sizes between 12px and 14px.
- **Structural Anchors (`Plus Jakarta Sans`):** Utilized selectively for view titles, section headers, and high-level aggregation KPIs.
- **Tabular Figures & Currency (`JetBrains Mono`):** Applied across all numeric records, tax brackets (ISR), deducciones (AFP, SFS), and Dominican Peso (`RD$`) balances. All numeric elements use `tnum` (tabular numbers) to align decimal points vertically down ledger columns.

## Layout & Spacing

The layout is structured around an industrial-grade **Fixed-Fluid Hybrid Grid System**:

- **Shell Architecture:**
  - Collapsible Primary Nav Drawer: Fixed `260px` (standard) or `68px` (compact).
  - Main Calculation Workstation: Fluid flex column conforming to a strict 12-column sub-grid with `1rem` gutters on tablet and `1.5rem` on desktop screens.
  - Split View Inspector Pane: Persistent right-hand drawer (`380px` to `480px`) used for side-by-side employee breakdown calculations (salario neto, AFP, SFS, ISR retenido).
- **Breakpoint Rules:**
  - **Desktop (≥ 1280px):** Full dual-pane operations (interactive data grid + instant side calculation inspector).
  - **Laptop / Tablet (768px – 1279px):** Inspector defaults to an overlaid modal drawer; tables switch to horizontal scroll with pinned sticky identifier columns (Cédula & Nombre).
  - **Mobile (< 768px):** Condensed card view stacks with approval-only capabilities; complex batch editing is deferred.
- **Density Profile:** Dense component spacing (`space-sm` for table cells and button padding) maximizing screen utility without sacrificing target size.

## Elevation & Depth

Visual hierarchy avoids heavy drop shadows, favoring **Crisp Surface Stacking with Structural Borders**:

- **Level 0 (App Canvas):** Baseline `#F8FAFC` flat surface.
- **Level 1 (Data Cards & Tables):** Flat `#FFFFFF` surface enclosed by a 1px solid `#E2E8F0` border. No drop shadow.
- **Level 2 (Active Calculation Drawers / Toolbars):** Background `#FFFFFF` framed with `border-l border-slate-200`, underpinned by a soft ambient edge: `box-shadow: -4px 0 16px -4px rgba(15, 23, 42, 0.06)`.
- **Level 3 (Modals, Bulk Action Bars, Context Menus):** High-contrast containment using a double-edge approach: `border: 1px solid #CBD5E1`, with `box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Dark Mode Surfaces):** `#1E293B` containers anchored over `#0F172A` background using `#334155` crisp separation borders. Shadows are replaced entirely with 1px luminescent border outlines.

## Shapes

The design system employs **Soft (`roundedness: 1`) geometric contours**:
- Standard components (buttons, input fields, badges, table rows) feature `0.25rem` (4px) radii.
- Modals, large panels, and dropdown containers feature `0.5rem` (8px) corner curves (`rounded-lg`).
- Tabular items, status pills, and toggle indicators remain strictly controlled to avoid informal playful rounding, keeping the environment engineered and precise.

## Components

### 1. High-Density Data Tables
- **Header:** Background `#F8FAFC`, uppercase 11px Inter medium text with sort carrots, border-bottom 1px solid `#CBD5E1`.
- **Rows:** Alternating subtle zebra striping (`#FFFFFF` to `#FBFCFD`), height 40px, cell padding `0.5rem 0.75rem`. Hover state applies `#F1F5F9`.
- **Pinned Columns:** Cédula and Empleado columns are locked left with a border-right `#CBD5E1` and subtle right gradient fade.
- **Cell Content:** Numerical figures are right-aligned using `JetBrains Mono` with explicit currency signs (`RD$`).

### 2. Action Buttons
- **Primary:** Background `#10B981`, hover `#059669`, text white, height 36px, horizontal padding 14px, radius 4px. Bold font-weight.
- **Secondary (Destructive / Caution):** White background, border 1px solid `#E2E8F0`, text `#0F172A`, hover `#F8FAFC`.
- **Batch Processing Triggers:** Integrated with micro-spinners and locked during background recalculations.

### 3. Status Badges
- Strict composition: `12px Icon + 11px Inter font-weight 600 text`.
- Layout: 4px border radius, padding `2px 8px`.
- Combinations:
  - *Pagado:* Checkmark icon + text `#065F46`, background `#D1FAE5`.
  - *Pendiente TSS:* Clock icon + text `#92400E`, background `#FEF3C7`.
  - *Error IR-3:* Alert triangle icon + text `#991B1B`, background `#FEE2E2`.

### 4. Input Fields & Selects
- Height 34px (compact), background `#FFFFFF`, border 1px solid `#CBD5E1`.
- Focus state: Border `#10B981` with an outer ring `0 0 0 2px rgba(16, 185, 129, 0.2)`.
- Currency Input: Prepended non-editable `RD$` label in monospaced format.

### 5. Split Payroll Calculation Panel
- Sticky right-side layout dedicated to individual voucher inspection.
- Header: Employee identity card with Cedula formatted as `XXX-XXXXXXX-X`.
- Ledger Body: Key-value rows detailing *Salario Bruto*, deductions (*TSS: SFS 3.04%*, *AFP 2.87%*, *DGII: ISR Escala*), and *Neto a Pagar* highlighted in a separate `#ECFDF5` container with `20px JetBrains Mono`.

### 6. Filter & Language Bar
- Segmented language switcher: `ES` (Dominican Spanish - default) | `EN` (US English).
- Quick Filters: Quincena selection chips (1ra Quincena, 2da Quincena, Regalía Pascual / Sueldo 13) styled as radio buttons with crisp slate borders.