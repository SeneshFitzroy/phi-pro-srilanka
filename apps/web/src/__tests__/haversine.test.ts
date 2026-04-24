// ============================================================================
// Haversine Distance + Crypto — Unit Tests (Vitest)
// ============================================================================

import { describe, it, expect } from 'vitest';
import { haversineDistance, DENGUE_CLUSTER_RADIUS_METRES } from '@phi-pro/shared';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(6.9167, 79.875, 6.9167, 79.875)).toBe(0);
  });

  it('detects same-cluster points within 150m', () => {
    // Two points ~100m apart in Borella
    const dist = haversineDistance(6.9167, 79.875, 6.9168, 79.8751);
    expect(dist).toBeLessThan(DENGUE_CLUSTER_RADIUS_METRES);
  });

  it('rejects points further than 150m', () => {
    // Borella vs Narahenpita (~2km apart)
    const dist = haversineDistance(6.9167, 79.875, 6.8986, 79.8756);
    expect(dist).toBeGreaterThan(DENGUE_CLUSTER_RADIUS_METRES);
  });

  it('DENGUE_CLUSTER_RADIUS_METRES is 150', () => {
    expect(DENGUE_CLUSTER_RADIUS_METRES).toBe(150);
  });

  it('returns metres (Earth radius = 6,371,000m)', () => {
    // Colombo to Kandy ≈ 100km
    const dist = haversineDistance(6.9271, 79.8612, 7.2906, 80.6337);
    expect(dist).toBeGreaterThan(90_000);
    expect(dist).toBeLessThan(120_000);
  });
});
