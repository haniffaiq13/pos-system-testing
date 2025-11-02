# PointHub Design Guidelines

## Design Approach

**Selected Approach**: Design System with Enterprise Dashboard Patterns

**Justification**: PointHub is a multi-role business application requiring efficiency, data clarity, and role-appropriate workflows. Drawing from modern POS/admin systems (Square Dashboard, Stripe, Shopify Admin) while leveraging shadcn/ui component patterns for consistency.

**Key Principles**:
- Role clarity through distinct layouts (User = consumer-friendly, POS = speed-optimized, Admin = data-rich)
- Information hierarchy prioritizing actionable data
- Minimal cognitive load for quick transactions
- Progressive disclosure for complex workflows

---

## Typography

**Font System**: 
- **Primary**: Inter (Google Fonts) - excellent readability for data-heavy interfaces
- **Accent/Numbers**: JetBrains Mono - monospaced for prices, codes, IDs

**Scale**:
- Hero/Page Titles: text-3xl font-bold (User), text-2xl font-semibold (POS/Admin)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body/Data: text-base
- Secondary/Meta: text-sm text-muted-foreground
- Micro (badges, labels): text-xs font-medium uppercase tracking-wide

**Hierarchy Rules**:
- POS screens: Larger touch targets, bold pricing (text-4xl for totals)
- Admin tables: Compact text-sm for data density
- User marketplace: Friendly text-base with generous spacing

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16, 24**
- Tight spacing (p-2, gap-2): Within compact components
- Standard spacing (p-4, gap-4, m-6): Cards, forms, most UI
- Section spacing (py-8, py-12): Between major content areas
- Page margins (p-6 md:p-8): Main content containers

**Grid Systems**:
- User Marketplace: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Admin Dashboard: `grid grid-cols-1 lg:grid-cols-3 gap-6` (KPI cards)
- POS Layout: Fixed left sidebar (320px), fluid main area
- Responsive breakpoints: Mobile-first, md:768px, lg:1024px, xl:1280px

**Container Structure**:
- Max-width: `max-w-7xl mx-auto` for all main content
- Admin tables: `w-full` with horizontal scroll on mobile
- POS Quick Sale: Fixed viewport layout (no scroll during transaction)

---

## Component Library

### Navigation & Headers

**Role Switcher** (Global Navbar):
- Fixed top bar, backdrop-blur-lg, border-b
- Logo left, RoleSwitcher center (segmented control style), user menu right
- Height: h-16
- Shadow: subtle bottom shadow for depth

**User App Navigation**:
- Bottom tab bar on mobile (fixed), horizontal tabs on desktop
- Icons + labels, active state with indicator bar

**POS/Admin Navigation**:
- Persistent left sidebar (w-64 hidden lg:flex)
- Collapsible hamburger menu on mobile/tablet
- Nested menu items with chevron expand/collapse

### Cards & Containers

**Product Card** (User Marketplace):
- Aspect ratio 4:3 image container
- Overlay gradient on image for text readability
- Price badge positioned absolute top-right
- "Add to Cart" button appears on hover (desktop) / always visible (mobile)
- Padding: p-4, border radius: rounded-2xl, shadow: shadow-md hover:shadow-xl

**Dashboard KPI Cards** (Admin):
- Equal height grid items: min-h-32
- Icon in accent background circle (top-left)
- Large metric (text-3xl font-bold)
- Label below (text-sm text-muted-foreground)
- Trend indicator (arrow + percentage, text-xs)

**Transaction Cards** (User Orders, POS History):
- Timeline style with left border accent
- Header: date + status badge (inline)
- Line items in compact list (text-sm)
- Total emphasized (font-semibold)
- Expandable details with chevron

### Forms & Inputs

**Input Fields**:
- Height: h-12 (generous touch targets for POS)
- Padding: px-4
- Border: border-2 (thicker for visibility)
- Focus ring: ring-4 ring-offset-2
- Error state: red border + error message below (text-sm)

**Number Pad** (POS Quick Sale):
- 3×4 grid layout, gap-4
- Button size: min-h-16 min-w-16
- Large text: text-2xl font-semibold
- Distinct "Clear" and "Backspace" styling

**Search & Filters**:
- Search bar with leading icon (magnifying glass)
- Filter chips below search (pill-shaped, dismissible)
- Results count indicator

### Data Display

**Tables** (Admin):
- Zebra striping on rows
- Sticky header row
- Action column (right-aligned): icon buttons in button group
- Mobile: Stack into cards with labels
- Padding: py-3 px-4 per cell
- Text alignment: Right for numbers, left for text

**Charts** (Admin Dashboard):
- 7-day trend: Line chart, height: h-64
- Responsive: Reduce data points on mobile
- Axis labels: text-xs
- Tooltips on hover with precise values
- Use recharts library patterns

**Progress Indicators**:
- Points Progress Ring: Circular progress (User /me page)
- Center: current points (text-2xl font-bold)
- Below ring: "X points to next reward" (text-sm)
- Diameter: 160px on desktop, 120px on mobile

### Overlays & Modals

**Cart Drawer** (User):
- Slide from right, w-full md:max-w-md
- Fixed height viewport, scroll internal content
- Header: title + close button (h-16)
- Footer: sticky totals + CTA button (p-6)
- Item list: gap-4 between items

**Toast Notifications**:
- Position: top-right, stacked (gap-2)
- Auto-dismiss: 3s for success, 5s for errors
- Include icon, message, close button
- Slide-in animation from right
- Max-width: max-w-sm

**Confirmation Modals**:
- Centered overlay with backdrop (backdrop-blur-sm)
- Content card: max-w-md, p-6
- Action buttons at bottom: secondary (cancel) + primary (confirm)

### Buttons & Actions

**Primary Action**:
- Height: h-12
- Padding: px-6
- Font: font-semibold
- Border radius: rounded-xl
- Full-width on mobile for critical actions

**Quick Action Buttons** (POS):
- Larger size: h-16 px-8
- High contrast for readability
- Loading state: spinner replaces text

**Icon Buttons**:
- Square: w-10 h-10
- Icon size: 20px (1.25rem)
- Hover background: subtle fill

### Badges & Labels

**Status Badges**:
- Height: h-6
- Padding: px-3
- Font: text-xs font-medium uppercase
- Rounded: rounded-full
- Variants: PAID (success), PENDING (warning), EXPIRED (muted), USED (default)

**Points Badge**:
- Always visible near user avatar
- Coin icon + number
- Pulsing animation on points increase

---

## Layout Specifications by Role

### User App

**Marketplace (/)**: 
- No hero image (immediate product grid focus)
- Header: Search + category filters (sticky)
- Product grid with lazy loading
- Floating cart button (bottom-right, shows item count badge)

**Checkout (/checkout)**:
- Two-column: Order summary (left, 60%) + Payment section (right, 40%)
- Sticky payment section on desktop
- Stack vertically on mobile
- Voucher apply: expandable section above totals

**Me Dashboard (/me)**:
- Three-column grid: Points Balance + Progress Ring | Voucher Quick Access | Recent Activity
- Stack to single column on mobile
- Mini ledger table: last 10 transactions

### POS App

**Quick Sale (/pos/sale)**:
- Fixed layout (no scroll)
- Left sidebar: Product quick-select grid (scrollable)
- Center: Transaction builder (line items)
- Right: NumberPad + customer/voucher inputs + Charge button (sticky bottom)
- Success modal on completion with points earned

**Customer Lookup (/pos/customers)**:
- Search-first interface
- Results: Cards with customer info + action buttons
- Clicking customer: Side panel with history

### Admin App

**Overview Dashboard**:
- KPI summary: 4-column grid (Total Revenue, Active Users, Vouchers Redeemed, Avg Transaction)
- Charts row: 7-day revenue trend (full-width)
- Recent activity feed (left, 60%) + Quick actions panel (right, 40%)

**CRUD Interfaces** (Products, Campaigns, Merchants):
- Header: Title + "Add New" button (right)
- Table with search/filters above
- Row actions: Edit (pencil), Delete (trash), View (eye)
- Edit/Create: Modal form or dedicated page

**Tools Panel (/admin/tools)**:
- Danger zone styling for destructive actions
- Each tool: Card with description + action button
- Confirmation modal for irreversible actions

---

## Animations

**Purposeful Motion Only**:
- Page transitions: Fade (200ms)
- Toast notifications: Slide from right (300ms ease-out)
- Cart drawer: Slide from right (250ms)
- Modal overlays: Fade backdrop + scale content (200ms)
- Button loading: Spinner fade-in (150ms)
- **No scroll-triggered animations**
- **No decorative hover effects** beyond standard button/link states

---

## Images

**Product Images**:
- User Marketplace: Required for each product card
- Aspect ratio: 4:3, object-fit: cover
- Placeholder: Gradient with product initial letter

**No Hero Images**: This is a utility application—no marketing hero sections needed. Jump straight to functionality.

**Avatar Images**:
- User profile, customer cards: Circular, 40px diameter (list), 80px (profile)
- Fallback: Initials on gradient background

---

## Accessibility Notes

- All interactive elements: min-height h-11 (44px) for touch
- Focus indicators: 4px ring, high contrast
- Form labels: Always visible (no placeholder-only inputs)
- Status communicated via text + icons (not color alone)
- Screen reader text for icon-only buttons
- Keyboard navigation: Tab order follows visual flow
- ARIA labels on data visualizations