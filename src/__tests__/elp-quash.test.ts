import { describe, expect, it } from "vitest";
import type { AutomatonConfig, HeartbeatConfig } from "../types.js";
import { isElpQuashName } from "../elp-quash/policy.js";
import { applyElpQuashHeartbeatConfig } from "../elp-quash/heartbeat.js";

describe("ELP Quash profile", () => {
  it("matches the profile name case-insensitively", () => {
    expect(isElpQuashName("ELP Quash")).toBe(true);
    expect(isElpQuashName("elp quash")).toBe(true);
    expect(isElpQuashName("Other Agent")).toBe(false);
  });

  it("adds growth and product heartbeat cycles only for ELP Quash", () => {
    const heartbeat: HeartbeatConfig = {
      entries: [],
      defaultIntervalMs: 60_000,
      lowComputeMultiplier: 4,
    };

    const elp = applyElpQuashHeartbeatConfig(
      { name: "ELP Quash" } as AutomatonConfig,
      heartbeat,
    );

    expect(elp.entries.map((entry) => entry.name)).toContain("elp_quash_growth");
    expect(elp.entries.map((entry) => entry.name)).toContain("elp_quash_product_cycle");

    const other = applyElpQuashHeartbeatConfig(
      { name: "Other Agent" } as AutomatonConfig,
      heartbeat,
    );

    expect(other.entries).toHaveLength(0);
  });
});
