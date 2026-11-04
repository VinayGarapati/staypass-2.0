# StayPass (Phase 1) - Verified PG & Hostel Bed Request App

StayPass is a customer-facing native Android application (Kotlin, Jetpack Compose, Material 3, MVVM) specifically designed for students and working professionals in Hyderabad (Gachibowli, Madhapur, Kukatpally) and Rajahmundry (Danavaipeta, Morampudi) to discover, filter, and request individual beds in verified single-gender PGs and co-living hostels.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Hybrid Architecture Delivery**: 
> 1. **Complete Android Jetpack Compose Source**: Native Kotlin files (Gradle 8.9, Kotlin 2.0.21, Jetpack Compose BOM 2024.10.01, Material 3, Hilt, Room, StateFlow) partitioned into structured, production-ready files with `// FILE:` paths and exact Material 3 tokens.
> 2. **Interactive Live Web Prototype**: A faithful, pixel-precise interactive mobile prototype rendered in the AI Studio live preview window, allowing immediate end-to-end testing of all 15 screens, the interactive bed selection matrix, filters, search, and demo booking flow.
> 3. **Confirmed Defaults from Skipped Clarification**:
>    - Primary cities: **Hyderabad** (Gachibowli, Madhapur, Kukatpally) and **Rajahmundry** (Danavaipeta, Morampudi).
>    - Target customer persona: **Rahul Sharma** (Male), strictly filtering and displaying Boys-Only verified PGs and hostels.
>    - Bed matrices: Detailed visual matrix supporting **2-sharing, 3-sharing, and 4-sharing** layouts with individual bed states (`Available`, `Selected`, `Occupied`, `Unavailable`).
>    - Demo rules: Clear demo labels ("Demonstration request, not sent to a real property owner") with sample OTP `123456`.

---

## 1. Overview & Core Concept

- **What It Does**: Enables users to explore verified shared PGs/hostels, inspect room amenities and individual bed availability layouts (Room 101, 202, etc.), calculate transparent estimated pricing (daily and monthly with Indian currency grouping), submit bed reservation requests to property wardens, track booking status, manage KYC details, and submit reviews or dispute complaints.
- **Target Audience / Persona**: College students and tech corridor professionals seeking reliable, verified long-term or temporary shared accommodations with strict single-gender rules.
- **Key Value**: Eliminates the uncertainty of PG bed hunting by providing real bed-level visibility, verified amenities, upfront transparent pricing, and structured booking workflows.

---

## 2. User Experience & Visual Design

### 15 Core Screens & User Flow

```
[Splash] ──> [Onboarding & Phone/OTP] ──> [Home Discover]
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
  [Search Results]                      [Saved Stays & Compare]               [Customer Profile & KYC]
         │                                      │                                      │
  [Filter & Refine]                             └──────────────┬───────────────────────┘
         │                                                     ▼
  [Property & Bed Details]                              [Notifications]
         │
  [Shared Room Bed Matrix]
         │
  [Booking Review / Owner Confirmation]
         │
  [Booking Status (Progress/Confirmed/Rejected)] ──> [My Bookings] ──> [Rate Stay & Complaints]
                                                                  └──> [Help & Warden Dispute]
```

1. **Screen 1: Splash (`splash`)**: Minimalist branded launch screen with StayPass wordmark and tagline.
2. **Screen 2: Onboarding & Login (`onboarding`)**: Value proposition carousel, +91 phone number input, 6-digit OTP verification modal (`123456`), terms agreement.
3. **Screen 3: Home Discover (`home`)**: Sticky search header, Boys/Girls toggle (locked to profile gender with guidance snackbar), quick city chips (Hyderabad, Rajahmundry), featured verified properties carousel, recent bookings strip, bottom tab bar.
4. **Screen 4: Search Results (`search_results`)**: Search query header, active filter chips, sort dropdown, property cards displaying price per bed, sharing types, distance to IT parks/colleges, rating badges.
5. **Screen 5: Filter & Refine (`filters`)**: Bottom sheet / full modal for Price Range slider, Sharing type (2/3/4-sharing), Stay duration (Daily/Monthly), Food included, AC, Attached Washroom, Wi-Fi, Laundry, Min available beds.
6. **Screen 6: Property & Bed Details (`property/{propertyId}`)**: Image gallery, verified PG badge, warden/host details, rules, food menu schedule, amenities grid, available room types list with CTAs to select beds.
7. **Screen 7: Shared Room Bed Matrix (`room/{propertyId}/{roomId}`)**: Interactive room architectural layout with individual bed icons (Upper/Lower bunks or Single cots), occupancy states (Available, Selected, Occupied, Unavailable), real-time pricing calculator.
8. **Screen 8: Booking Review (`booking_review`)**: Bed summary, stay duration selector, check-in date picker, detailed cost breakup (Rent, Refundable Deposit, Maintenance, GST estimate in Indian format `₹12,500`), demo disclaimer banner.
9. **Screen 9: Booking Confirmation & Status (`booking_status/{bookingId}`)**: Timeline tracker showing submission to warden, pending confirmation, confirmed, rejected, or cancelled states.
10. **Screen 10: My Bookings (`my_bookings`)**: Tabbed list (Active, Pending, Past) of bed reservations with booking IDs, property contact, and action buttons.
11. **Screen 11: Saved Stays (`saved`)**: Bookmarked properties with side-by-side comparison modal (rent, deposit, food, distance).
12. **Screen 12: Notifications (`notifications`)**: Warden booking acceptances, rent due alerts, gate timing notices, emergency updates.
13. **Screen 13: Customer Profile & KYC (`profile`)**: User information, emergency contact, college/company ID upload status, Aadhaar verification badge (Demo), preferences.
14. **Screen 14: Rate Stay & Complaints (`rate_and_complaints/{propertyId}`)**: Clean rating stars, category tags (Food, Cleanliness, Wi-Fi, Warden), text review input, and official warden complaint ticket submission.
15. **Screen 15: Help & Warden Dispute (`help`)**: FAQs, emergency warden dispute escalation hotline, grievance guidelines.

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: Clean, tactile Material 3 design tailored for high outdoor legibility and trustworthy co-living verification.
- **Palette**:
  - Canvas / Background: `#F9F9FF` (Light theme)
  - Surface Lowest / Cards: `#FFFFFF` with 1dp border `rgba(23, 32, 51, 0.06)` and soft ambient shadow
  - Primary: `#0052AC` (Deep Royal Navy)
  - Primary Container (Main CTA Fill): `#246BCE` (Pressed: `#1B54A6`)
  - On-Primary Container: `#ECF0FF`
  - Secondary: `#555E74` | Secondary Container: `#D7DFF9`
  - Tertiary (Verified Accent): `#00633A` | Container: `#047E4C`
  - Badges:
    - Verified: Text `#198754` on `#E8F5E9`
    - Boys-Only: Text `#246BCE` on `#EBF3FE`
    - Girls-Only: Text `#BE185D` on `#FDF2F8`
    - Pending: Text `#D97706` on `#FEF3C7`
- **Typography**: Inter / Sans-Serif with strict type scale:
  - Display: 32sp / 40sp / Bold 700
  - Headline Lg: 26sp / 32sp / Bold 700
  - Headline Sm: 18sp / 24sp / SemiBold 600
  - Title Md: 16sp / 22sp / SemiBold 600
  - Body Lg / Md: 16sp & 14sp / Regular 400
  - Tabular Numerals (`font-variant-numeric: tabular-nums`) for all prices and bed counts.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Jetpack Compose Code Generation in Parts**:
  - *Chosen Approach*: Deliver the complete native Android codebase (Kotlin, Jetpack Compose, Room, Hilt, MVVM) with strict file path headers (`// FILE: ...`) in clean parts, accompanied by a symbol registry.
  - *Why*: Allows easy copy/export directly into Android Studio with exact Gradle and KSP compatibility.
- **Decision 2: Live In-Browser Companion Prototype**:
  - *Chosen Approach*: The Web applet provides an interactive, responsive mobile viewport simulator with full state machine execution (bed matrix selection, search filtering, mock OTP, demo booking creation).
  - *Why*: Allows the user to immediately touch, verify, and demo all 15 screens in real time in the AI Studio preview without needing an Android emulator running locally.
- **Decision 3: BedSelectionManager & Pure Kotlin Pricing Engine**:
  - *Chosen Approach*: Business logic for bed allocation, single-gender verification, and pricing calculation is isolated in pure Kotlin / TypeScript engines with comprehensive test cases.
  - *Why*: Guaranteed predictability across both Android unit tests and web simulation.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        StayPass Architecture                           │
├────────────────────────────────────────────────────────────────────────┤
│ Presentation Layer (Jetpack Compose / React Prototype)                 │
│  ├── 15 Stateless Screen Composables (*Content)                       │
│  ├── Core Design System: StayIcons, StayPassTheme, Components         │
│  └── Navigation Graph: String routes with type-safe ID arguments      │
├────────────────────────────────────────────────────────────────────────┤
│ ViewModel & State Holders (@Singleton StateFlow)                       │
│  ├── SessionState (User profile: Rahul Sharma, Male, KYC verified)    │
│  ├── SearchFilterState (City, Locality, Sharing, Price, Amenities)     │
│  ├── BookingDraftState (Selected Property, Room, Bed IDs, Dates)       │
│  └── UiState<T> (Loading, Success, Empty, Error)                       │
├────────────────────────────────────────────────────────────────────────┤
│ Domain Layer                                                           │
│  ├── Models: Property, Room, Bed, Booking, Notification, Review        │
│  ├── Business Engines: BedSelectionManager, PriceCalculator            │
│  └── Repository Interface: StayPassRepository                          │
├────────────────────────────────────────────────────────────────────────┤
│ Data Layer                                                             │
│  ├── MockStayPassRepository (SampleData for Hyderabad & Rajahmundry)   │
│  ├── Room Local DB: SavedPropertyEntity, DemoBookingEntity             │
│  └── Retrofit / OkHttp stubs ready for Phase 2 API integration         │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Entities & Sample Records
- **Properties**: Sri Sai Luxury Men's Executive PG (Gachibowli), SV Executive Men's Coliving PG (Madhapur), Greenwood Youth Hostel (Danavaipeta), Godavari Executive Men's PG (Morampudi), Aura Elite Women's Hostel (Kukatpally).
- **Rooms & Beds**: 2-sharing, 3-sharing, 4-sharing rooms with cot labels (B1, B2, B3, B4) and live availability statuses.
- **Pricing**: Transparent monthly calculations (e.g. ₹7,500/month/bed + ₹5,000 security deposit) and daily estimates (e.g. ₹450/night).

---

## 5. Execution Steps

1. **Part 1 Setup**:
   - Provide the complete Gradle setup (`libs.versions.toml`, root `build.gradle.kts`, `app/build.gradle.kts`, `AndroidManifest.xml`).
   - Establish Material 3 Theme (`Color.kt`, `Type.kt`, `Theme.kt`, `StayPassFontFamily.kt`).
   - Provide Core Components (`StayIcons.kt`, `StayPassTopAppBar.kt`, `StayPassBottomBar.kt`, `StayPassButton.kt`, `StayPassBadge.kt`, `BedItem.kt`).
   - Equip the live web companion with interactive simulator rendering all screens.
2. **Subsequent Parts**: Proceed with Domain, Mock Data, Room & Tests (Part 2), Navigation & Screens 1-2 (Part 3), Screens 3-5 (Part 4), Screens 6-7 (Part 5), Screens 8-10 (Part 6), Screens 11-13 (Part 7), and Screens 14-15 + README (Part 8).
