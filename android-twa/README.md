# StayPass – Google Play Store Deployment Guide

This project is configured as a **Trusted Web Activity (TWA)**, the official Google-recommended architecture for publishing Progressive Web Applications directly to the **Google Play Store**.

---

## Method 1: Instant CLI Build with Bubblewrap (Recommended)

Google's official `bubblewrap` CLI converts your verified web app into a Google Play-ready Android App Bundle (`.aab`):

### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### 2. Build Android App Bundle (.aab)
Because `twa-manifest.json` is already pre-configured at the root of this project:
```bash
bubblewrap build
```

This generates `app-release-bundle.aab` in your working directory.

---

## Method 2: Android Studio Build

1. Open the `/android-twa` folder in **Android Studio** (Hedgehog / Iguana or later).
2. Sync Gradle files (`File > Sync Project with Gradle Files`).
3. Build the release bundle:
   `Build > Generate Signed Bundle / APK > Android App Bundle`.
4. Choose your release keystore and export the signed `.aab`.

---

## Google Play Console Submission Steps

1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name**: `StayPass - PG & Hostel Bed Request`
   - **Default language**: English (India)
   - **App or game**: App
   - **Free or paid**: Free
3. **App Content & Compliance**:
   - **Privacy Policy**: Link to your deployed privacy page.
   - **Target audience**: 18+ (college students and working professionals).
   - **Category**: Housing / Travel & Local.
4. **App Release**:
   - Go to **Production > Create new release**.
   - Upload `app-release-bundle.aab`.
   - Name release: `1.0.0 (Initial Release)`.
5. **Digital Asset Links Verification**:
   - In Play Console, navigate to **App integrity > App Signing**.
   - Copy the **SHA-256 certificate fingerprint** provided by Google Play.
   - Paste it into `public/.well-known/assetlinks.json` on your domain.
   - This ensures the browser address bar is permanently hidden when launched from the home screen or Play Store.
