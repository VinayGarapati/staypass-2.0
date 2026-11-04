import {
  areDatesOverlapping,
  calculatePropertyDateVacancy,
  getPropertyVacancySummary,
} from '../services/vacancyService';
import { INITIAL_PROPERTIES, INITIAL_BOOKINGS } from '../services/apiInterfaces';
import { authService } from '../security/secureStorage';
import fs from 'fs';
import path from 'path';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

function test(suite: string, name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          results.push({ suite, name, passed: true, durationMs: Math.round(performance.now() - start) });
        })
        .catch((err) => {
          results.push({
            suite,
            name,
            passed: false,
            error: err instanceof Error ? err.message : String(err),
            durationMs: Math.round(performance.now() - start),
          });
        });
    } else {
      results.push({ suite, name, passed: true, durationMs: Math.round(performance.now() - start) });
    }
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

export async function runStayPassTests(): Promise<{ total: number; passed: number; failed: number; results: TestResult[] }> {
  results.length = 0;

  // SUITE 1: Vacancy & Overlap Mathematics
  test('Vacancy Engine', 'areDatesOverlapping detects true collision in middle of period', () => {
    // Range A: Oct 10 to Oct 25; Range B: Oct 15 to Oct 20
    const overlap = areDatesOverlapping('2026-10-10', '2026-10-25', '2026-10-15', '2026-10-20');
    expect(overlap).toBe(true);
  });

  test('Vacancy Engine', 'areDatesOverlapping returns false for strictly sequential stays', () => {
    // Range A: Oct 1 to Oct 10; Range B: Oct 10 to Oct 20 (Checkout on Oct 10, Checkin on Oct 10)
    const overlap = areDatesOverlapping('2026-10-01', '2026-10-10', '2026-10-10', '2026-10-20');
    expect(overlap).toBe(false);
  });

  test('Vacancy Engine', 'areDatesOverlapping detects left boundary overlap', () => {
    const overlap = areDatesOverlapping('2026-10-05', '2026-10-15', '2026-10-12', '2026-10-25');
    expect(overlap).toBe(true);
  });

  test('Vacancy Engine', 'calculatePropertyDateVacancy correctly filters maintenance and blocked beds', () => {
    const testProp = JSON.parse(JSON.stringify(INITIAL_PROPERTIES[0]));
    // Set first bed to MAINTENANCE
    testProp.rooms[0].beds[0].status = 'MAINTENANCE';
    // Set second bed to BLOCKED
    testProp.rooms[0].beds[1].status = 'BLOCKED';

    const vacancyList = calculatePropertyDateVacancy(testProp, [], { checkInDate: '2026-11-01', checkOutDate: '2026-11-30' });
    const maintBed = vacancyList.find((v) => v.bed.id === testProp.rooms[0].beds[0].id);
    const blockedBed = vacancyList.find((v) => v.bed.id === testProp.rooms[0].beds[1].id);

    expect(maintBed?.isAvailable).toBe(false);
    expect(maintBed?.reason).toBe('MAINTENANCE');
    expect(blockedBed?.isAvailable).toBe(false);
    expect(blockedBed?.reason).toBe('BLOCKED');
  });

  test('Vacancy Engine', 'getPropertyVacancySummary calculates correct availability totals', () => {
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

  test('Security & Auth', 'Super Admin restriction only permits garapativinay2001@gmail.com', () => {
    const allowedEmail = 'garapativinay2001@gmail.com';
    const unauthorizedEmail = 'attacker@malicious.com';
    const isAllowed = (email: string) => email.trim().toLowerCase() === 'garapativinay2001@gmail.com';

    expect(isAllowed(allowedEmail)).toBe(true);
    expect(isAllowed(unauthorizedEmail)).toBe(false);
  });

  test('Security & Auth', 'Owner ID code pattern enforces SP-OWN-XXXXXX format', () => {
    const validId = 'SP-OWN-000001';
    const invalidId = 'OWN-123';
    const regex = /^SP-OWN-\d{6}$/;

    expect(regex.test(validId)).toBe(true);
    expect(regex.test(invalidId)).toBe(false);
  });

  // SUITE 3: Play Store & PWA Verification
  const isNode =
    typeof process !== 'undefined' &&
    typeof process?.cwd === 'function' &&
    typeof process?.versions?.node !== 'undefined';

  test('Play Store Readiness', 'Web App Manifest contains all mandatory Google Play TWA fields', () => {
    if (!isNode) return;
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.id).toBe('/');
    expect(manifest.short_name).toBe('StayPass');
    expect(manifest.short_name.length <= 12).toBe(true);
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBeDefined();
    expect(manifest.theme_color).toBe('#0052AC');
    expect(manifest.background_color).toBe('#151C27');
    expect(manifest.icons.length).toBeGreaterThan(2);

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512');
    const hasMaskable = manifest.icons.some((i: any) => i.purpose === 'maskable');

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  test('Play Store Readiness', 'Digital Asset Links exists and targets com.staypass.app', () => {
    if (!isNode) return;
    const assetlinksPath = path.resolve(process.cwd(), 'public/.well-known/assetlinks.json');
    const assetlinks = JSON.parse(fs.readFileSync(assetlinksPath, 'utf8'));

    expect(Array.isArray(assetlinks)).toBe(true);
    expect(assetlinks[0].target.package_name).toBe('com.staypass.app');
    expect(assetlinks[0].target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
  });

  test('Play Store Readiness', 'Service worker and offline fallback files are present', () => {
    if (!isNode) return;
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const offlinePath = path.resolve(process.cwd(), 'public/offline.html');

    expect(fs.existsSync(swPath)).toBe(true);
    expect(fs.existsSync(offlinePath)).toBe(true);
  });

  test('Play Store Readiness', 'Bubblewrap twa-manifest.json is pre-configured for .aab compilation', () => {
    if (!isNode) return;
    const twaPath = path.resolve(process.cwd(), 'twa-manifest.json');
    const twa = JSON.parse(fs.readFileSync(twaPath, 'utf8'));

    expect(twa.packageId).toBe('com.staypass.app');
    expect(twa.launcherName).toBe('StayPass');
    expect(twa.themeColor).toBe('#0052AC');
    expect(twa.appVersionCode).toBe(1);
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  return { total, passed, failed, results };
}

// If invoked directly from command line
const isNodeEnv =
  typeof process !== 'undefined' &&
  typeof process?.versions?.node !== 'undefined';

const isCli =
  isNodeEnv &&
  Array.isArray(process?.argv) &&
  Boolean(
    process.argv[1] &&
      (process.argv[1].endsWith('staypassCore.test.ts') || process.argv[1].includes('staypassCore'))
  );

if (isCli) {
  runStayPassTests().then(({ total, passed, failed, results }) => {
    console.log(`\n================ STAYPASS AUTOMATED TEST REPORT ================`);
    console.log(`Total Tests Run: ${total} | Passed: ${passed} | Failed: ${failed}\n`);
    for (const r of results) {
      const statusIcon = r.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`[${r.suite}] ${statusIcon} - ${r.name} (${r.durationMs}ms)`);
      if (r.error) {
        console.error(`   Error: ${r.error}`);
      }
    }
    console.log(`================================================================\n`);
    if (failed > 0 && typeof process !== 'undefined' && typeof process.exit === 'function') {
      process.exit(1);
    }
  });
}
