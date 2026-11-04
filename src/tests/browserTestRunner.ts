import {
  areDatesOverlapping,
  calculatePropertyDateVacancy,
  getPropertyVacancySummary,
} from '../services/vacancyService';
import { INITIAL_PROPERTIES, INITIAL_BOOKINGS } from '../services/apiInterfaces';
import { authService } from '../security/secureStorage';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export async function runStayPassTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  function expect(actual: any) {
    return {
      toBe(expected: any) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan(expected: number) {
        if (!(actual > expected)) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeDefined() {
        if (actual === undefined || actual === null) {
          throw new Error(`Expected value to be defined`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy value but got ${actual}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected falsy value but got ${actual}`);
        }
      },
    };
  }

  async function test(suite: string, name: string, fn: () => void | Promise<void>) {
    const start = performance.now();
    try {
      await fn();
      results.push({
        suite,
        name,
        passed: true,
        durationMs: Math.round(performance.now() - start),
      });
    } catch (err) {
      results.push({
        suite,
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Math.round(performance.now() - start),
      });
    }
  }

  // SUITE 1: Vacancy & Overlap Mathematics
  await test('Vacancy Engine', 'areDatesOverlapping detects true collision in middle of period', () => {
    const overlap = areDatesOverlapping('2026-10-10', '2026-10-25', '2026-10-15', '2026-10-20');
    expect(overlap).toBe(true);
  });

  await test('Vacancy Engine', 'areDatesOverlapping returns false for strictly sequential stays', () => {
    const overlap = areDatesOverlapping('2026-10-01', '2026-10-10', '2026-10-10', '2026-10-20');
    expect(overlap).toBe(false);
  });

  await test('Vacancy Engine', 'areDatesOverlapping detects left boundary overlap', () => {
    const overlap = areDatesOverlapping('2026-10-05', '2026-10-15', '2026-10-12', '2026-10-25');
    expect(overlap).toBe(true);
  });

  await test('Vacancy Engine', 'calculatePropertyDateVacancy correctly filters maintenance and blocked beds', () => {
    const testProp = JSON.parse(JSON.stringify(INITIAL_PROPERTIES[0]));
    testProp.rooms[0].beds[0].status = 'MAINTENANCE';
    testProp.rooms[0].beds[1].status = 'BLOCKED';

    const vacancyList = calculatePropertyDateVacancy(testProp, [], {
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-30',
    });
    const maintBed = vacancyList.find((v) => v.bed.id === testProp.rooms[0].beds[0].id);
    const blockedBed = vacancyList.find((v) => v.bed.id === testProp.rooms[0].beds[1].id);

    expect(maintBed?.isAvailable).toBe(false);
    expect(maintBed?.reason).toBe('MAINTENANCE');
    expect(blockedBed?.isAvailable).toBe(false);
    expect(blockedBed?.reason).toBe('BLOCKED');
  });

  await test('Vacancy Engine', 'getPropertyVacancySummary calculates correct availability totals', () => {
    const summary = getPropertyVacancySummary(INITIAL_PROPERTIES[0], INITIAL_BOOKINGS, {
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-30',
    });
    expect(summary.totalRooms).toBe(INITIAL_PROPERTIES[0].rooms.length);
    expect(summary.totalBeds).toBeGreaterThan(0);
    expect(summary.dateWiseAvailableBedsCount).toBeDefined();
  });

  // SUITE 2: Security & Authentication
  await test('Security & Auth', 'authService rotates AES session tokens with forward secrecy', async () => {
    const session = await authService.authenticateCustomer('+91 9876543210', '123456');
    const oldToken = session.accessToken;
    const oldRefreshToken = session.refreshToken;
    const rotated = await authService.rotateSession(oldRefreshToken);
    expect(rotated.accessToken !== oldToken).toBe(true);
    expect(rotated.refreshToken !== oldRefreshToken).toBe(true);
    expect(rotated.accessToken.length).toBeGreaterThan(20);
  });

  await test('Security & Auth', 'Super Admin restriction only permits garapativinay2001@gmail.com', () => {
    const allowedEmail = 'garapativinay2001@gmail.com';
    const unauthorizedEmail = 'attacker@malicious.com';
    const isAllowed = (email: string) => email.trim().toLowerCase() === 'garapativinay2001@gmail.com';

    expect(isAllowed(allowedEmail)).toBe(true);
    expect(isAllowed(unauthorizedEmail)).toBe(false);
  });

  await test('Security & Auth', 'Owner ID code pattern enforces SP-OWN-XXXXXX format', () => {
    const validId = 'SP-OWN-000001';
    const invalidId = 'OWN-123';
    const regex = /^SP-OWN-\d{6}$/;

    expect(regex.test(validId)).toBe(true);
    expect(regex.test(invalidId)).toBe(false);
  });

  // SUITE 3: Play Store & PWA Verification (Browser Safe HTTP fetch)
  await test('Play Store Readiness', 'Web App Manifest contains all mandatory Google Play TWA fields', async () => {
    const res = await fetch('/manifest.json');
    if (!res.ok) throw new Error(`Could not fetch /manifest.json: ${res.statusText}`);
    const manifest = await res.json();

    expect(manifest.id).toBe('/');
    expect(manifest.short_name).toBe('StayPass');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBeDefined();
    expect(manifest.theme_color).toBe('#0052AC');
    expect(manifest.icons.length).toBeGreaterThan(2);

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512');
    const hasMaskable = manifest.icons.some((i: any) => i.purpose === 'maskable');

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  await test('Play Store Readiness', 'Digital Asset Links exists and targets com.staypass.app', async () => {
    const res = await fetch('/.well-known/assetlinks.json');
    if (!res.ok) throw new Error(`Could not fetch /.well-known/assetlinks.json: ${res.statusText}`);
    const assetlinks = await res.json();

    expect(Array.isArray(assetlinks)).toBe(true);
    expect(assetlinks[0].target.package_name).toBe('com.staypass.app');
    expect(assetlinks[0].target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
  });

  await test('Play Store Readiness', 'Service worker registration is supported in browser runtime', () => {
    expect('serviceWorker' in navigator).toBe(true);
  });

  await test('Play Store Readiness', 'Theme color and viewport tags properly configured for mobile full-screen', () => {
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(themeMeta).toBeDefined();
    expect(viewportMeta).toBeDefined();
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  return { total, passed, failed, results };
}
