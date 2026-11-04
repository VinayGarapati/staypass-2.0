import React, { useState } from 'react';
import { useStayPassStore } from './store/useStayPassStore';
import { UserRole } from './models/types';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { OwnerPortal } from './features/owner/OwnerPortal';
import { AdminPortal } from './features/admin/AdminPortal';
import {
  Smartphone,
  Apple,
  ShieldCheck,
  Building2,
  Lock,
  FileCode,
  CheckCircle2,
  X,
  Compass,
  Bed,
  Search,
  Bookmark,
  User,
  ExternalLink,
  Copy,
  Layers,
  Rocket
} from 'lucide-react';
import { PlayStoreDeploymentHub } from './components/PlayStoreDeploymentHub';
import { PWAInstallButton } from './components/PWAInstallButton';

export default function App() {
  const {
    devicePlatform,
    setDevicePlatform,
    activeRole,
    setActiveRole,
    toastMessage,
    dismissToast,
    isAdminTotpVerified,
  } = useStayPassStore();

  const [customerTab, setCustomerTab] = useState<'home' | 'search' | 'bookings' | 'saved' | 'profile'>('home');
  const [showCodeExplorer, setShowCodeExplorer] = useState<boolean>(false);
  const [explorerTab, setExplorerTab] = useState<'architecture' | 'schema' | 'security' | 'expo'>('architecture');
  const [showPlayStoreHub, setShowPlayStoreHub] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#EEF2F9] text-[#151C27] font-sans antialiased flex flex-col">
      {/* Top Application Migration & Role Switcher Bar */}
      <header className="bg-white border-b border-[#C2C6D5]/40 px-4 md:px-6 py-3 shrink-0 shadow-xs z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Migration Flag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052AC] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#0052AC] tracking-tight">StayPass</h1>
                <span className="bg-[#EBF3FE] text-[#246BCE] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#246BCE]/20">
                  React Native (Android + iOS)
                </span>
              </div>
              <p className="text-[11px] text-[#555E74]">
                Phase 1 Full Cross-Platform Migration • 3 Role-Based Portals
              </p>
            </div>
          </div>

          {/* Central Controls: Role Switcher & Platform Frame Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 3 Role Portals Switcher */}
            <div className="flex bg-[#F0F3FF] p-1 rounded-xl border border-[#C2C6D5]/40 text-xs font-semibold">
              <button
                onClick={() => setActiveRole('CUSTOMER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'CUSTOMER'
                    ? 'bg-[#246BCE] text-white shadow-xs'
                    : 'text-[#424753] hover:text-[#151C27]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                onClick={() => setActiveRole('OWNER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'OWNER'
                    ? 'bg-[#0052AC] text-white shadow-xs'
                    : 'text-[#424753] hover:text-[#151C27]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>PG Owner</span>
              </button>

              <button
                onClick={() => setActiveRole('ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'ADMIN'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#424753] hover:text-[#151C27]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>
            </div>

            {/* Platform Hardware Toggle (Android vs iOS) */}
            <div className="flex bg-[#F0F3FF] p-1 rounded-xl border border-[#C2C6D5]/40 text-xs font-semibold">
              <button
                onClick={() => setDevicePlatform('android')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                  devicePlatform === 'android'
                    ? 'bg-white text-[#151C27] shadow-xs'
                    : 'text-[#555E74] hover:text-[#151C27]'
                }`}
                title="Android Material 3 Device Frame"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#198754]" />
                <span className="hidden sm:inline">Android</span>
              </button>

              <button
                onClick={() => setDevicePlatform('ios')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                  devicePlatform === 'ios'
                    ? 'bg-white text-[#151C27] shadow-xs'
                    : 'text-[#555E74] hover:text-[#151C27]'
                }`}
                title="iOS Human Interface Guidelines Device Frame"
              >
                <Apple className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">iOS</span>
              </button>
            </div>

            {/* Code Explorer Toggle */}
            <button
              onClick={() => setShowCodeExplorer(!showCodeExplorer)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EEFE] text-[#0052AC] font-semibold text-xs rounded-xl hover:bg-[#D7DFF9] transition-colors border border-[#246BCE]/20"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showCodeExplorer ? 'Hide Code' : 'RN Source Tree'}</span>
            </button>

            {/* Play Store & PWA Deployment Hub */}
            <button
              onClick={() => setShowPlayStoreHub(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0052AC] text-white font-bold text-xs rounded-xl hover:bg-[#1B54A6] transition-colors shadow-xs"
              title="Google Play Store & PWA Deployment Hub"
            >
              <Rocket className="w-3.5 h-3.5 text-[#93F7BA]" />
              <span>Play Store Hub</span>
            </button>

            {/* In-App PWA Install Prompt Button */}
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Interactive Phone Simulator */}
        <main className="flex-1 p-3 md:p-6 flex items-center justify-center overflow-auto">
          <div
            className={`transition-all duration-300 relative flex flex-col overflow-hidden shadow-2xl ${
              devicePlatform === 'android'
                ? 'w-[390px] h-[810px] rounded-[36px] border-[10px] border-[#151C27] bg-[#F9F9FF]'
                : 'w-[393px] h-[820px] rounded-[48px] border-[12px] border-[#1F2937] bg-[#F9F9FF]'
            }`}
          >
            {/* Status Bar / Notch Area */}
            {devicePlatform === 'android' ? (
              /* Android Top System Bar with Camera Hole */
              <div className="h-7 w-full bg-[#151C27] flex items-center justify-between px-6 text-white text-[11px] font-medium shrink-0">
                <span>09:41</span>
                <div className="w-3.5 h-3.5 rounded-full bg-black/80 border border-white/20" />
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
            ) : (
              /* iOS Dynamic Island & Status Bar */
              <div className="h-10 w-full bg-[#1F2937] flex items-center justify-between px-6 text-white text-[12px] font-semibold shrink-0 pt-1">
                <span>9:41</span>
                {/* Dynamic Island pill */}
                <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">LTE</span>
                  <div className="w-4 h-2 border border-white rounded-xs p-0.5">
                    <div className="w-full h-full bg-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Portal Content Viewport */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeRole === 'CUSTOMER' && (
                <CustomerPortal currentTab={customerTab} onNavigateTab={setCustomerTab} />
              )}
              {activeRole === 'OWNER' && <OwnerPortal />}
              {activeRole === 'ADMIN' && <AdminPortal />}

              {/* In-Phone Customer Bottom Tab Navigation (Only visible on customer portal) */}
              {activeRole === 'CUSTOMER' && (
                <div className="h-14 bg-white border-t border-[#172033]/10 px-2 flex items-center justify-around shrink-0">
                  <button
                    onClick={() => setCustomerTab('home')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                      customerTab === 'home' ? 'bg-[#EBF3FE] text-[#246BCE]' : 'text-[#555E74]'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Home</span>
                  </button>
                  <button
                    onClick={() => setCustomerTab('search')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                      customerTab === 'search' ? 'bg-[#EBF3FE] text-[#246BCE]' : 'text-[#555E74]'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Explore</span>
                  </button>
                  <button
                    onClick={() => setCustomerTab('bookings')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                      customerTab === 'bookings' ? 'bg-[#EBF3FE] text-[#246BCE]' : 'text-[#555E74]'
                    }`}
                  >
                    <Bed className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Bookings</span>
                  </button>
                  <button
                    onClick={() => setCustomerTab('saved')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                      customerTab === 'saved' ? 'bg-[#EBF3FE] text-[#246BCE]' : 'text-[#555E74]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Saved</span>
                  </button>
                  <button
                    onClick={() => setCustomerTab('profile')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                      customerTab === 'profile' ? 'bg-[#EBF3FE] text-[#246BCE]' : 'text-[#555E74]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Hardware Navigation Bar */}
            {devicePlatform === 'android' ? (
              <div className="h-5 w-full bg-[#151C27] flex items-center justify-center shrink-0">
                <div className="w-20 h-1 bg-white/60 rounded-full" />
              </div>
            ) : (
              <div className="h-6 w-full bg-white flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-black/40 rounded-full" />
              </div>
            )}

            {/* In-App Floating Toast Banner */}
            {toastMessage && (
              <div className="absolute bottom-18 left-3 right-3 bg-[#151C27] text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl flex items-center justify-between z-50 animate-fade-in border border-white/10">
                <span>{toastMessage}</span>
                <button onClick={dismissToast} className="text-[#C2C6D5] ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right Side: React Native Source Code & Architecture Drawer */}
        {showCodeExplorer && (
          <aside className="w-full md:w-[460px] bg-[#0B0F17] text-slate-200 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#246BCE]" />
                  <span>React Native (TypeScript) Source</span>
                </h2>
                <p className="text-[11px] text-slate-400">Migrated from Kotlin Jetpack Compose</p>
              </div>
              <button onClick={() => setShowCodeExplorer(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explorer Tabs */}
            <div className="flex bg-slate-900 border-b border-slate-800 p-1 text-xs">
              <button
                onClick={() => setExplorerTab('architecture')}
                className={`flex-1 py-1.5 rounded font-medium ${
                  explorerTab === 'architecture' ? 'bg-[#246BCE] text-white' : 'text-slate-400'
                }`}
              >
                Structure
              </button>
              <button
                onClick={() => setExplorerTab('schema')}
                className={`flex-1 py-1.5 rounded font-medium ${
                  explorerTab === 'schema' ? 'bg-[#246BCE] text-white' : 'text-slate-400'
                }`}
              >
                Zod Schemas
              </button>
              <button
                onClick={() => setExplorerTab('security')}
                className={`flex-1 py-1.5 rounded font-medium ${
                  explorerTab === 'security' ? 'bg-[#246BCE] text-white' : 'text-slate-400'
                }`}
              >
                SecureStore
              </button>
              <button
                onClick={() => setExplorerTab('expo')}
                className={`flex-1 py-1.5 rounded font-medium ${
                  explorerTab === 'expo' ? 'bg-[#246BCE] text-white' : 'text-slate-400'
                }`}
              >
                package.json
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300">
              {explorerTab === 'architecture' && (
                <div>
                  <div className="text-emerald-400 mb-2">// DIRECTORY MAPPING (SECTION 6)</div>
                  <pre className="text-slate-400 mb-4">{`src/
├── theme/
│   └── index.ts          (Tokens matching Color.kt & Type.kt)
├── models/
│   └── types.ts          (Customer, Owner, Admin, Bed, Room)
├── schemas/
│   └── validationSchemas.ts (Zod verification)
├── security/
│   └── secureStorage.ts  (Expo SecureStore + Role Guards)
├── store/
│   └── useStayPassStore.ts (Zustand client state)
├── services/
│   └── apiInterfaces.ts  (DRF interfaces & Mock demo data)
├── components/
│   ├── StayPassBadge.tsx
│   ├── StayPassButton.tsx
│   ├── BedItem.tsx       (Cot occupancy states)
│   └── PropertyLocationMapCard.tsx (Google Maps)
└── features/
    ├── customer/CustomerPortal.tsx (15 screens)
    ├── owner/OwnerPortal.tsx       (Warden tools)
    └── admin/AdminPortal.tsx       (TOTP 2FA Console)`}</pre>
                </div>
              )}

              {explorerTab === 'schema' && (
                <div>
                  <div className="text-emerald-400 mb-2">// FILE: src/schemas/validationSchemas.ts</div>
                  <pre className="text-slate-300 select-all mb-4">{`export const CustomerPhoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\\d{9}$/, '10-digit mobile number starting 6-9'),
  countryCode: z.literal('+91').default('+91'),
});

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  totpCode: z.string().length(6).regex(/^\\d{6}$/),
});`}</pre>
                </div>
              )}

              {explorerTab === 'security' && (
                <div>
                  <div className="text-emerald-400 mb-2">// FILE: src/security/secureStorage.ts</div>
                  <pre className="text-slate-300 select-all mb-4">{`// Hardware Keystore (Android) & Keychain (iOS)
export async function saveSession(session: AuthSession) {
  await SecureStore.setItemAsync('user_session', JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

// Role authorization guard
export function canAccessPortal(requiredRole: UserRole, session: AuthSession | null) {
  if (requiredRole === 'ADMIN' && (!session || !session.isTotpVerified)) {
    return { authorized: false, reason: 'Google Authenticator 2FA required' };
  }
  return { authorized: true };
}`}</pre>
                </div>
              )}

              {explorerTab === 'expo' && (
                <div>
                  <div className="text-emerald-400 mb-2">// FILE: react-native-staypass/package.json</div>
                  <pre className="text-slate-300 select-all">{`{
  "name": "staypass-mobile",
  "version": "1.0.0",
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "react-native": "0.76.2",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.8",
    "zustand": "^5.0.0"
  }
}`}</pre>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Google Play Store & PWA Deployment Hub Modal */}
      <PlayStoreDeploymentHub
        isOpen={showPlayStoreHub}
        onClose={() => setShowPlayStoreHub(false)}
      />
    </div>
  );
}
