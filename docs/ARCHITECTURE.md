# Weave Lab architecture

## Constraints

- Standalone source repository, independent deployment, GitHub Pages-compatible static build.
- Dark-only mobile-first PWA with responsive desktop sidebar and mobile bottom navigation.
- No runtime backend, no subscription, no credentials, no external fonts or CDNs.
- Determinism and provenance are first-class. Any rule, seed, model revision and parameter change must be recorded with evidence.
- Never import a proprietary private-game source file into the public app without an explicit content/publication review.
- Weave game engine `main` must remain untouched by Lab development.

## Modules

| Module | Responsibility |
|---|---|
| `site/catalog.mjs` | Six canonical species lines, twelve provisional forms, source references and two explicit version presets |
| `site/math.mjs` | Pure damage functions, Shield/True/fixed resolution and Wilson intervals |
| `site/rng.mjs` | Deterministic LCG matching the seeded RNG shape used in Weave |
| `site/loom.mjs` | Generator, validation, connected Weave detection, swap, gravity/refill/Cascades, markers, seed-bank study |
| `site/draft.mjs` | Draft-first and Battle-first independent sampling; exclusive snake draft |
| `site/simulation.mjs` | Bounded synthetic Battle policy model, batch aggregate and paired-seed sensitivity |
| `site/simulation.worker.mjs` | Asynchronous isolated calculations to avoid locking mobile UI |
| `site/evidence.mjs` | Versioned evidence, local checksum, safe CSV, structural Weave Battle Report inspection |
| `site/storage.mjs` | Local settings, evidence history, backups, schema validation |
| `site/app.mjs` | UI rendering, navigation, forms, worker orchestration, charts and export actions |

## Study pipeline

1. Select approved rule mode and fixed seed. Establish hypothesis and one changed variable.
2. Record baseline synthetic evidence and configuration.
3. Change one parameter only, using common random seed range where possible.
4. Save results with numerical assumptions and confidence-interval method.
5. Repeat in the **actual pinned Weave engine** and collect signed-off replay/QA evidence, where available.
6. Conduct qualitative playtests to examine decisions, move timing, team variety and whether the mechanic feels fair.
7. Approve or reject balancing proposal through a separate controlled work item; never make silent canonical edits.

## Explicitly out of scope for v1

- Exact v0.2 engine; full status effect/reaction chain semantics; complete six-line first-gen kits.
- Multiplayer netcode, ranking, matchmaking, user accounts or database sync.
- CI integration to private Weave engine or write operations to Notion/Linear.
- Final art, animation system, sprite generation or soundtrack.
- Security/cryptographic verification of imported game reports; local FNV checksum is a convenient integrity marker only.

## Planned robust parity adapter

Once v0.2 ships, implement a **read-only engine adapter** in a private test package. Pin a specific commit and ruleset fingerprint, run the same seeded action sequence in Weave and a Lab diagnostic harness, and diff deterministic snapshots. Promote individual gameplay mechanics to `exact-engine` only when these parity checks pass. Keep the synthetic policy mode as a separate exploration tool and label every output accordingly.
