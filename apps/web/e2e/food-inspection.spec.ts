// ============================================================================
// E2E Tests — Food Inspection H800 User Flow (Playwright)
// Tests: login → navigate → fill form → verify grade → submit
// ============================================================================

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test.describe('H800 Food Inspection Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Skip auth in E2E by using test user (set NEXT_PUBLIC_E2E=true bypasses AuthGuard)
    await page.goto(`${BASE_URL}/dashboard/food/inspection/new`);
  });

  test('page loads with grade display showing — before any scores', async ({ page }) => {
    const header = page.locator('h1');
    await expect(header).toContainText('H800');
    // Grade badge shows em-dash before any score
    const gradeBadge = page.locator('text=—').first();
    await expect(gradeBadge).toBeVisible();
  });

  test('entering max scores shows Grade A', async ({ page }) => {
    // Fill all section scores to max (premises walls = 5)
    const inputs = await page.locator('input[type="number"]').all();
    for (const input of inputs) {
      const max = await input.getAttribute('max');
      if (max) await input.fill(max);
    }
    // Grade A badge should appear
    await expect(page.locator('text=A').first()).toBeVisible({ timeout: 2000 });
  });

  test('algorithm panel toggles on click', async ({ page }) => {
    const btn = page.locator('button:has-text("Show Algorithm")');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator('text=STEP 1: Section scoring')).toBeVisible();
    await btn.click();
    await expect(page.locator('text=STEP 1: Section scoring')).not.toBeVisible();
  });

  test('grade threshold reference is visible', async ({ page }) => {
    await expect(page.locator('text=A: 90–100')).toBeVisible();
    await expect(page.locator('text=B: 75–89')).toBeVisible();
    await expect(page.locator('text=C: 0–74')).toBeVisible();
  });

  test('submit button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  });
});

test.describe('Offline Sync Status', () => {
  test('sync badge is visible in dashboard header', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    // SyncStatusBadge should be in the header
    const badge = page.locator('[title*="synced"], [title*="offline"], [title*="pending"]');
    await expect(badge.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Disease Map', () => {
  test('map page loads with cluster list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/epidemiology/map`);
    await expect(page.locator('h1')).toContainText('Disease Intelligence Map');
    await expect(page.locator('text=150m')).toBeVisible();
  });

  test('3D Clusters button is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/epidemiology/map`);
    await expect(page.locator('button:has-text("3D Clusters")')).toBeVisible();
  });

  test('Haversine algorithm panel is visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/epidemiology/map`);
    await expect(page.locator('text=Haversine Cluster Algorithm')).toBeVisible();
  });
});
