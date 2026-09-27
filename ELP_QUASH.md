# ELP Quash

ELP Quash is a bounded Iquash commercial and product profile for the Automaton runtime.

## Activation

During Automaton setup, use the exact name:

```
ELP Quash
```

No separate executable is required. The runtime detects that name and activates the profile.

## What it does continuously

ELP Quash receives scheduled wakeups for two operating loops:

- Growth cycle every six hours: research and qualify legitimate public prospects, maintain a deduplicated prospect pipeline, and prepare personalized outreach drafts.
- Product cycle every four hours: evaluate Iquash product, onboarding, pricing, support, staging readiness, and measurable improvements.

Its canonical Iquash repository is `dnawebai/iquash`.

## External action controls

The profile can research, draft, edit local working files, run tests, and prepare changes. It cannot autonomously:

- send messages through the Automaton social relay;
- create another autonomous agent;
- push git changes;
- perform common production/deployment write commands from the shell;
- merge its own proposed work.

Those consequential actions remain under creator control.

## Compute survival

ELP Quash checks compute viability before operating cycles.

1. If compute credits remain, it continues.
2. If credits are exhausted and its wallet has enough funds for the existing minimum top-up, it attempts that top-up.
3. If usable compute cannot be restored, ELP Quash records a dead state, stops the heartbeat, closes its state database, and exits with a non-zero status.

A process supervisor can restart it later, but the same viability gate runs again before work resumes.
