# PointHub - Loyalty Points & POS System

## Overview
PointHub is a comprehensive multi-role loyalty points and POS system built with React, featuring three distinct user experiences: User (customer shopping), POS (point-of-sale transactions), and Admin (system management).

## Recent Changes (2025-01-02)
- Initial application structure created with full-stack JavaScript template
- Implemented complete data schema for products, orders, users, vouchers, campaigns, and merchants
- Built modular API layer with mockAdapter (localStorage) and realAdapter (backend ready)
- Created all core UI components: ProductCard, CartDrawer, PriceSummary, VoucherApply, NumberPad, ProgressRing, etc.
- Implemented complete User App: Marketplace, Checkout, Points Dashboard, Voucher Redemption, Order History
- Implemented POS App: Quick Sale interface with NumberPad, Customer Lookup
- Implemented Admin App: Overview Dashboard with KPIs and charts, Product Management, User Directory, Admin Tools
- Configured role-based navigation with RoleSwitcher, sidebars, and bottom tabs
- Seeded with demo data: 3 user accounts (admin@demo.io, pos@demo.io, hanif@demo.io), 6 products

## Project Architecture

### Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **State Management**: Zustand for client state, React Query for server state
- **Routing**: Wouter
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Data Persistence**: localStorage (mockAdapter) with backend-ready structure (realAdapter)

### Key Features
1. **Role-Based Access**: Three roles (user, pos, admin) with dedicated UIs
2. **Points System**: Automatic points accrual on purchases (configurable formula)
3. **Voucher System**: Multi-tier redemption (100/200/500 points), with min spend and 50% discount cap
4. **Payment Simulation**: Xendit simulation (PENDING → PAID in 3 seconds)
5. **Modular API**: Toggle between mock and real backend via environment variables

### Business Rules
- Points Formula: `points = floor(total / accrualPer)` (default: 10,000)
- Min Spend Formula: `max(50,000, voucherValue * 2)`
- Discount Cap: 50% of subtotal (configurable)
- Voucher Expiry: 90 days (configurable)

## User Preferences
- Design System: Teal-green theme (#0D9488, #F0FDF4)
- Border Radius: rounded-2xl for cards (16px)
- Typography: Inter for body, JetBrains Mono for numbers/codes
- Spacing: 2, 4, 6, 8, 12, 16, 24 units
- Animations: Purposeful motion only (no scroll-triggered effects)

## Environment Variables
```
VITE_USE_MOCKS=true          # Use localStorage mock adapter
VITE_API_BASE_URL=http://localhost:8080  # Backend API URL
```

## File Structure
```
client/src/
├── api/                     # API layer
│   ├── mockAdapter.ts       # localStorage implementation
│   ├── realAdapter.ts       # Backend HTTP client
│   ├── types.ts            # API interfaces
│   └── index.ts            # Adapter selector
├── components/             # Reusable components
│   ├── ui/                # shadcn components
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   ├── PriceSummary.tsx
│   ├── VoucherApply.tsx
│   ├── NumberPad.tsx
│   ├── ProgressRing.tsx
│   ├── RoleSwitcher.tsx
│   └── ...
├── pages/                  # Route pages
│   ├── user/              # User app pages
│   ├── pos/               # POS app pages
│   └── admin/             # Admin app pages
├── store/                  # Zustand stores
│   ├── session.ts
│   ├── cart.ts
│   └── posTransaction.ts
├── utils/                  # Utilities
│   ├── money.ts           # Rupiah formatting
│   ├── rules.ts           # Business logic
│   └── persist.ts         # localStorage helpers
└── App.tsx                # Main routing

shared/
└── schema.ts              # Shared types & Drizzle schema

server/
├── routes.ts              # API routes (not implemented)
└── storage.ts             # Storage interface
```

## Demo Accounts
- **Admin**: admin@demo.io / password
- **POS**: pos@demo.io / password (Outlet: Jakarta A)
- **User**: hanif@demo.io / password (150 points)

## Development Notes
- Default user auto-selected on load: hanif@demo.io
- All data persisted to localStorage with `pointhub:` prefix
- Mock webhook simulation uses setTimeout for 3-second delay
- Seed data includes 6 products priced 60k-400k IDR
- Campaign defaults: accrualPer=10000, redeemValue=500, discountCapPct=50, expiryDays=90
