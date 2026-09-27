import type { AutomatonConfig, HeartbeatConfig } from "../types.js";
import { isElpQuashName } from "./policy.js";

export function applyElpQuashHeartbeatConfig(
  config: AutomatonConfig,
  heartbeat: HeartbeatConfig,
): HeartbeatConfig {
  if (!isElpQuashName(config.name)) return heartbeat;

  const entries = [...heartbeat.entries];
  const add = (entry: HeartbeatConfig["entries"][number]) => {
    if (!entries.some((existing) => existing.name === entry.name)) {
      entries.push(entry);
    }
  };

  add({
    name: "elp_quash_growth",
    schedule: "17 */6 * * *",
    task: "elp_quash_growth",
    enabled: true,
  });

  add({
    name: "elp_quash_product_cycle",
    schedule: "47 */4 * * *",
    task: "elp_quash_product_cycle",
    enabled: true,
  });

  return { ...heartbeat, entries };
}
