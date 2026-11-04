# StayPass – React Native (Android + iOS) Cross-Platform Migration

StayPass is the customer, owner, and admin cross-platform mobile application for discovering and requesting verified single-gender beds in PGs and co-living hostels across Hyderabad (Gachibowli, Madhapur, Kukatpally) and Rajahmundry (Danavaipeta, Morampudi).

This application was migrated from **Kotlin & Jetpack Compose** to **React Native with TypeScript and Expo**, preserving 100% of the visual styling, Material 3 design tokens, and core business rules while unlocking unified execution on both **Android** and **iOS**.

---

## 1. Migration Summary & Architecture Mapping

| Layer / Feature | Original Kotlin / Jetpack Compose | Migrated React Native (TypeScript) |
| :--- | :--- | :--- |
| **Framework** | Android SDK 35, Jetpack Compose BOM `2024.10.01` | React Native `0.76.2` + Expo SDK `52` |
| **Language** | Kotlin `2.0.21` | TypeScript `5.3` (Strict Mode) |
| **Navigation** | `androidx.navigation:navigation-compose` | Expo Router `v4` with typed routes & platform gestures |
| **State Management**| Hilt + StateFlow `UiState<T>` | Zustand `useStayPassStore` + TanStack Query |
| **Form Validation** | Manual regex Kotlin validators | Zod Schemas (`CustomerPhoneSchema`, `AdminLoginSchema`) |
| **Sensitive Storage**| Android DataStore & EncryptedSharedPreferences | `expo-secure-store` (Hardware Keystore & iOS Keychain) |
| **UI Components** | Stateless Compose functions (`BedItem`, `StayPassBadge`) | React Native cross-platform functional components |
| **Vector Mapping** | Pure Compose Canvas vector draw | Multiplatform Vector SVG Canvas with Google Maps overlay |

---

## 2. Three Role-Based Portals

### 1. Customer Portal
- **Login**: +91 Mobile number + SMS OTP (`123456` in demo mode).
- **Profile Persona**: Rahul Sharma (Male, Aadhaar KYC Verified).
- **Single-Gender Rule**: Filter locked to Boys-Only properties matching customer profile.
- **Bed Matrix**: Visual Cot architectural layout (Available, Selected, Occupied, Unavailable).
- **Google Maps**: Pinned location in Hyderabad tech corridor or Rajahmundry Godavari riverfront with route guidance.
- **Booking Request**: Transparent pricing with Indian formatting (`₹8,500/mo + ₹5,000 deposit`).

### 2. PG / Hostel Owner Portal
- **Login**: Owner ID (e.g. `OWN-HYD-101`) + Password.
- **Dashboard**: Live occupancy percentage, gross revenue estimate, active resident beds.
- **Booking Requests**: Accept/Reject pending customer requests with 1-click bed allocation.
- **Live Bed Matrix**: Tap any bed cot to toggle vacant/occupied state directly.

### 3. Super Admin Portal (Exclusive Access)
- **Login**: Authorized email + Password + **6-digit Google Authenticator TOTP** (`123456`).
- **Platform KPIs**: Total listed beds, city cluster breakdown, platform occupancy %.
- **Owner Approvals**: Review KYC trade licenses and issue official `OWN-XXX-###` IDs.
- **Safety Verifications**: Audit checklist (Biometric gate, CCTV 24/7, hygiene, fire safety).
- **Security Audit Trail**: Immutable chronological log with actor email, role, action, and IP.

---

## 3. How to Run Locally

### Prerequisites
- Node.js 18+ and npm / bun / yarn
- **For Android**: Android Studio, JDK 17, and an Android Virtual Device (AVD) or physical device with USB debugging.
- **For iOS**: macOS with Xcode 15+ and CocoaPods (or Expo Go on physical iPhone).

### Installation & Execution
```bash
# 1. Navigate to the project directory
cd react-native-staypass

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start

# 4. Launch on Android Emulator / Physical Device
npx expo run:android

# 5. Launch on iOS Simulator (macOS only)
npx expo run:ios
```

---

## 4. Security Architecture (Secure by Design)

1. **Hardware-Backed Credential Storage**: Authentication sessions and refresh tokens are stored exclusively via `expo-secure-store`, backed by the Android Keystore and iOS Keychain. No secrets are stored in `AsyncStorage`.
2. **Server-Enforced Authorization**: Roles (`CUSTOMER`, `OWNER`, `ADMIN`) are enforced via server endpoints and validated client-side by `canAccessPortal` route guards.
3. **Google Authenticator 2FA**: Super Admin access mandates 6-digit TOTP verification. TOTP secrets are never bundled inside the client application.
4. **Data Sanitization**: All loggers apply `sanitizeLogPayload` to redact passwords, tokens, and personal identifiers from telemetry.

---

## 5. Backend Integration (Django REST Framework)
The app is wired for Phase 2 Django REST Framework + PostgreSQL + Redis deployment. All interfaces match Django DTOs:
- `POST /api/v1/auth/customer/verify-otp/`
- `POST /api/v1/auth/owner/login/`
- `POST /api/v1/auth/admin/totp-challenge/`
- `GET  /api/v1/properties/`
- `POST /api/v1/bookings/request/`
- `PATCH /api/v1/bookings/{id}/status/`
