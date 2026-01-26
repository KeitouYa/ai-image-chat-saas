/**
 * Feature Flags System
 * Simple in-memory feature flags (can be extended to use Redis/DB)
 */

interface FeatureFlag {
  enabled: boolean;
  description?: string;
  rollout?: number; // Percentage of users (0-100)
}

const featureFlags: Record<string, FeatureFlag> = {
  // Example flags
  CACHE_ENABLED: { enabled: true, description: "Enable Redis caching" },
  FALLBACK_PROVIDER: {
    enabled: true,
    description: "Enable AI provider fallback",
  },
  ADMIN_DASHBOARD: {
    enabled: true,
    description: "Enable admin dashboard",
  },
  ANALYTICS_TRACKING: {
    enabled: false,
    description: "Enable analytics tracking",
  },
  AB_TESTING: {
    enabled: false,
    description: "Enable A/B testing",
  },
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: string): boolean {
  const feature = featureFlags[flag];
  if (!feature) {
    return false; // Default to disabled if flag doesn't exist
  }

  // If rollout is specified, check percentage
  if (feature.rollout !== undefined) {
    // Simple hash-based rollout (can be improved)
    const hash = Math.abs(
      flag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );
    return hash % 100 < feature.rollout;
  }

  return feature.enabled;
}

/**
 * Get all feature flags (admin only)
 */
export function getAllFeatureFlags(): Record<string, FeatureFlag> {
  return { ...featureFlags };
}

/**
 * Set feature flag (admin only - in production, use DB/Redis)
 */
export function setFeatureFlag(
  flag: string,
  enabled: boolean,
  rollout?: number
): void {
  if (featureFlags[flag]) {
    featureFlags[flag].enabled = enabled;
    if (rollout !== undefined) {
      featureFlags[flag].rollout = rollout;
    }
  } else {
    featureFlags[flag] = { enabled, rollout };
  }
}


