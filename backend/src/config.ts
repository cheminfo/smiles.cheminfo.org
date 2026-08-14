import { env } from 'node:process';

import { parseTrustProxy } from './utils/parseTrustProxy.ts';

/**
 * Read a positive integer from the environment.
 * @param name - Variable name.
 * @param fallback - Value used when unset or not a number.
 * @param minimum - Smallest accepted value.
 * @returns The configured value.
 */
function integer(name: string, fallback: number, minimum = 1): number {
  const value = Number(env[name]);
  return Number.isFinite(value) && value >= minimum ? value : fallback;
}

export const config = {
  /** Derived from the project creation date, 2026-08-14. */
  port: integer('PORT', 10_814),
  trustProxy: parseTrustProxy(env.TRUST_PROXY),
  /**
   * The analytics provider's `<script>` tag, put into every page the service
   * serves. Unset, nothing is loaded and nothing is measured.
   */
  trackingScript: env.TRACKING_SCRIPT,
  /** How many structures one call may convert. */
  maxBatch: integer('MAX_BATCH', 100_000),
  /** Largest request body the service accepts, in bytes. */
  maxBodyBytes: integer('MAX_BODY_BYTES', 250 * 1024 * 1024),
};
