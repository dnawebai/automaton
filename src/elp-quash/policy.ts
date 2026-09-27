/**
 * ELP Quash policy.
 *
 * This profile is intentionally bounded: it may research, draft, test and
 * prepare changes autonomously, but consequential external actions stay under
 * creator approval.
 */
export const ELP_QUASH_POLICY = Object.freeze({
  name: "ELP Quash",
  productRepository: "dnawebai/iquash",
  homepage: "https://iquash.com",
  requireCreatorApprovalFor: [
    "outbound_messages",
    "production_deployments",
    "additional_agents",
    "self_authored_merges",
  ],
  allowAutomaticStaging: true,
  stopWhenComputeUnavailable: true,
} as const);

export function isElpQuashName(name: string): boolean {
  return name.trim().toLowerCase() === ELP_QUASH_POLICY.name.toLowerCase();
}
