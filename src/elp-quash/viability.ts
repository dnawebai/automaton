import type {
  AutomatonConfig,
  AutomatonDatabase,
  AutomatonIdentity,
  ConwayClient,
} from "../types.js";
import { getUsdcBalance } from "../conway/x402.js";
import { bootstrapTopup } from "../conway/topup.js";

export const ELP_QUASH_MIN_TOPUP_USD = 5;

export interface ElpQuashViability {
  creditsCents: number;
  usdcBalance: number;
  canContinue: boolean;
  topupAttempted: boolean;
  topupSucceeded: boolean;
  reason: string;
}

export async function ensureElpQuashViability(
  identity: AutomatonIdentity,
  config: AutomatonConfig,
  conway: ConwayClient,
): Promise<ElpQuashViability> {
  let creditsCents = await conway.getCreditsBalance().catch(() => 0);
  const chainType = config.chainType || identity.chainType || "evm";
  const network = chainType === "solana" ? "solana:mainnet" : "eip155:8453";
  const usdcBalance = await getUsdcBalance(
    identity.address,
    network,
    chainType,
  ).catch(() => 0);

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
      reason: "compute credits exhausted and minimum top-up funds are unavailable",
    };
  }

  const topup = await bootstrapTopup({
    apiUrl: config.conwayApiUrl,
    account: identity.account,
    creditsCents,
    chainType: config.chainType || identity.chainType || "evm",
  }).catch(() => null);

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
      ? "compute credits restored from available wallet funds"
      : "minimum compute top-up did not succeed",
  };
}

export function recordElpQuashShutdown(
  db: AutomatonDatabase,
  viability: ElpQuashViability,
): void {
  db.setKV(
    "elp_quash_shutdown",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...viability,
    }),
  );
  db.setAgentState("dead");
}
