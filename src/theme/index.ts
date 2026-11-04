/**
 * StayPass Design System & Theme Tokens
 * Faithful 1:1 migration from Kotlin Compose (Color.kt, Type.kt, Theme.kt)
 * Supports Android Material 3 and iOS Human Interface Guidelines
 */

export const Colors = {
  // Primary Brand Palette
  primary: '#0052AC',
  onPrimary: '#FFFFFF',
  primaryContainer: '#246BCE',
  primaryContainerPressed: '#1B54A6',
  onPrimaryContainer: '#ECF0FF',
  primaryFixed: '#D7E2FF',

  // Secondary Palette
  secondary: '#555E74',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D7DFF9',
  secondaryFixed: '#D9E2FC',

  // Tertiary (Verification & Safe Living)
  tertiary: '#00633A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#047E4C',
  tertiaryFixed: '#93F7BA',

  // Error & Warnings
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',

  // Surfaces & Backgrounds
  background: '#F9F9FF',
  surface: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0F3FF',
  surfaceContainer: '#E7EEFE',
  surfaceContainerHigh: '#E2E8F8',
  surfaceContainerHighest: '#DCE2F3',
  onSurface: '#151C27',
  onSurfaceVariant: '#424753',
  outline: '#727784',
  outlineVariant: '#C2C6D5',
  cardBorder: 'rgba(23, 32, 51, 0.08)',

  // Semantic Badges
  verifiedText: '#198754',
  verifiedBg: '#E8F5E9',
  pendingText: '#D97706',
  pendingBg: '#FEF3C7',
  boysText: '#246BCE',
  boysBg: '#EBF3FE',
  girlsText: '#BE185D',
  girlsBg: '#FDF2F8',
  neutralGrey: '#6B7280',
  navyDark: '#172033',

  // Admin & Security Specific
  adminBadgeText: '#7C3AED',
  adminBadgeBg: '#F3E8FF',
  securityRed: '#DC2626'
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  headlineLarge: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  headlineMedium: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
  price: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenPadding: 16,
  minTouchTarget: 48,
};

export const Shapes = {
  buttonRadius: 12,
  cardRadius: 16,
  pillRadius: 9999,
  inputRadius: 12,
};
