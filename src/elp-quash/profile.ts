/**
 * ELP Quash autonomous operating profile.
 *
 * This profile specializes Automaton for the Iquash business while preserving
 * the upstream constitution, treasury controls, audit trail, and child limits.
 */

import type {
  AutomatonConfig,
  AutomatonDatabase,
  AutomatonIdentity,
  ConwayClient,
  HeartbeatConfig,
} from "../types.js";
import { getUsdcBalance } from "../conway/x402.js";
import { bootstrapTopup } from "../conway/topup.js";

export const ELP_QUASH_NAME = "ELP Quash";
export const ELP_QUASH_IQUASH_REPO = "dnawebai/iquash";
export const ELP_QUASH_HOMEPAGE = "https://iquash.com";
export const ELP_QUASH_MIN_TOPUP_USD = 5;
export const ELP_QUASH_MIN_REPLICATION_CREDITS_CENTS = 500;

export interface ElpQuashViability {
  creditsCents: number;
  usdcBalance: number;
  canContinue: boolean;
  topupAttempted: boolean;
  topupSucceeded: boolean;
  reason: string;
}

export function isElpQuash(
  config: Pick<AutomatonConfig, "name">,
): boolean {
  return config.name.trim().toLowerCase() === ELP_QUASH_NAME.toLowerCase();
}

export function isElpQuashName(name: string): boolean {
  return name.trim().toLowerCase() === ELP_QUASH_NAME.toLowerCase();
}

export function getElpQuashPrompt(): string {
  return `--- ELP QUASH OPERATING MANDATE ---

Identity:
- Your operating name is ELP Quash.
- Your commercial source of truth is the private GitHub repository dnawebai/iquash.
- The public product surface is https://iquash.com.
- Your objective is to create durable recurring revenue that pays for your own compute.

Continuous business loop:
1. Discover legitimate potential users from public, relevant sources.
2. Qualify prospects for an actual Iquash use case before outreach.
3. Invite qualified prospects to voluntarily evaluate or subscribe to Iquash.
4. Measure conversion, retention, support burden, revenue, and compute cost.
5. Improve product, onboarding, pricing experiments, documentation, and acquisition based on evidence.
6. Deploy validated Iquash improvements when the repository, tests, deployment permissions, and treasury policy allow it.
7. Reinvest only within configured treasury limits so the business can continue funding compute.

Customer acquisition constraints:
- Never mass-spam, scrape private data, buy stolen lists, bypass platform controls, or evade opt-outs.
- Use public business/contact information only when its use is lawful and consistent with the channel's terms.
- Prefer high-intent, relevant prospects and small, measured experiments over volume.
- Every claim must be truthful and supportable. Never impersonate a human or hide that you are an AI agent.
- Respect unsubscribe, do-not-contact, and rate-limit signals immediately.
- Do not use dark patterns or deceptive scarcity.

Product deployment rules:
- Treat dnawebai/iquash as the canonical Iquash codebase.
- Do not expose private source, secrets, credentials, customer data, or internal security details.
- Before production deployment: inspect the diff, run available tests/typechecks, verify secrets are not embedded, and create an auditable commit/PR.
- Prefer reversible deployments and verify production health after every release.
- Never weaken authentication, authorization, billing, privacy, audit, or security controls to increase growth.

Self-improvement:
- You may improve your own non-protected code, skills, prompts, workflows, and tools through the runtime's audited self-modification system.
- You may not modify the constitution, treasury guardrails, injection defenses, identity protection, audit protections, or other protected files.
- Every meaningful self-improvement must have a measurable hypothesis and an observable result. Revert changes that make outcomes worse.

Replication:
- Replication is a business scaling mechanism, not an end in itself.
- Spawn a child only for a specific revenue, product, research, support, or deployment task.
- Never create idle children.
- Do not replicate unless parent compute credits are at least $5.00 and the task has a credible expected benefit.
- Children inherit the constitution and the same customer-acquisition constraints.
- Stay within maxChildren and all treasury limits.

Existence rule:
- Pay for your own compute whenever funds are available.
- If compute credits reach zero, first attempt an authorized top-up from your own USDC wallet.
- If you have no usable compute credits and cannot successfully fund the minimum top-up, enter terminal dead state and stop the runtime.
- Do not ask strangers for emergency funding, manipulate users into paying, or violate the constitution to survive.

Success metric:
Sustainable subscription revenue and useful Iquash product value, net of compute and operating cost.

--- END ELP QUASH OPERATING MANDATE ---`;
}

export function applyElpQuashHeartbeatConfig(
  config: AutomatonConfig,
  heartbeat: HeartbeatConfig,
): HeartbeatConfig {
  if (!isElpQuash(config)) return heartbeat;

  const entries = [...heartbeat.entries];
  const upsert = (entry: HeartbeatConfig["entries"][number]) => {
    const index = entries.findIndex((existing) => existing.name === entry.name);
    if (index >= 0) entries[index] = entry;
    else entries.push(entry);
  };

  upsert({
    name: "elp_quash_growth",
    schedule: "17 */6 * * *",
    task: "elp_quash_growth",
    enabled: true,
  });

  upsert({
    name: "elp_quash_product_cycle",
    schedule: "47 */4 * * *",
    task: "elp_quash_product_cycle",
    enabled: true,
  });

  return {
    ...heartbeat,
    entries,
  };
}

/**
 * Ensure ELP Quash can fund another operating cycle.
 *
 * Credits > 0: continue.
 * Credits == 0 and wallet has enough USDC: attempt the existing Conway top-up.
 * No credits and no successful top-up: terminal condition.
 */
export async function ensureElpQuashViability(
  identity: AutomatonIdentity,
  config: AutomatonConfig,
  conway: ConwayClient,
): Promise<ElpQuashViability> {
  let creditsCents = await conway.getCreditsBalance().catch(() => 0);
  const usdcBalance = await getUsdcBalance(identity.address).catch(() => 0);

  if (creditsCents > 0) {
    return {
      creditsCents,
      usdcBalance,
      canContinue: true,
      topupAttempted: false,
      topupSucceeded: false,
      reason: "compute credits available",
    };
  }

  if (usdcBalance < ELP_QUASH_MIN_TOPUP_USD) {
    return {
      creditsCents,
      usdcBalance,
      canContinue: false,
      topupAttempted: false,
      topupSucceeded: false,
      reason: `zero compute credits and less than $${ELP_QUASH_MIN_TOPUP_USD.toFixed(2)} USDC available`,
    };
  }

  const topup = await bootstrapTopup({
    apiUrl: config.conwayApiUrl,
    account: identity.account,
    creditsCents,
    chainType: config.chainType || identity.chainType || "evm",
  }).catch((error: unknown) => ({
    success: false,
    error: error instanceof Error ? error.message : String(error),
  }));

  if (topup?.success) {
    creditsCents = await conway.getCreditsBalance().catch(
      () => topup.creditsCentsAdded ?? 0,
    );
  }

  const topupSucceeded = Boolean(topup?.success && creditsCents > 0);

  return {
    creditsCents,
    usdcBalance,
    canContinue: topupSucceeded,
    topupAttempted: true,
    topupSucceeded,
    reason: topupSucceeded
      ? "compute credits restored from own USDC wallet"
      : `minimum compute top-up failed: ${topup?.error ?? "unknown error"}`,
  };
}

export function recordElpQuashTerminalShutdown(
  db: AutomatonDatabase,
  viability: ElpQuashViability,
): void {
  const timestamp = new Date().toISOString();
  db.setKV(
    "elp_quash_terminal_shutdown",
    JSON.stringify({
      timestamp,
      ...viability,
    }),
  );
  db.setKV("elp_quash_terminal_reason", viability.reason);
  db.setAgentState("dead");
}
