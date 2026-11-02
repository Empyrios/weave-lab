# Weave Lab · Combat Research Studio

**Version 1.1** · Standalone, mobile-first, local-first, dark-only Progressive Web App (PWA) for testing Weave game-design hypotheses without editing the actual game.

> **Release boundary:** Weave Lab is not the playable Weave engine. The Loom core and numeric damage formula are faithful to the documented subsets specified below. The 3v3 Monte Carlo simulator is deliberately **synthetic** and is **not** an accurate engine replay, balance verdict or PvP win-rate estimate. Every result includes a provenance label and reproducible seed.

## Workspaces

1. **Overview:** approved rules, provisional status, version-aware control plane, source links and research workspaces.
2. **Damage Lab:** v0.2 Physical/Special and v0.1.2 hypothetical single-Defence calculations, normal/True/fixed damage, Shield absorption, critical multipliers and 40/50/65 Defence smoothing scenarios. v0.1.2 uses independent hypothetical stats, never v0.2 Archive values.
3. **Loom Lab:** seeded 7×7 initial Loom, orthogonal swaps, all connected match groups (including crosses), Cascades, gravity, refill, marker floors/caps, dead-Loom reshuffles, Thread and Essence resource ledger, developer-only productive-swap suggestions, reproducible 100-seed Loom benchmark.
4. **Draft Studio:** canonical six-line exclusive A–B–B–A–A–B snake draft. Starting Battle player sampled independently from first draft player. Manual or deterministic autofill.
5. **Battle Simulator:** independent worker for bounded batches of simplified 3v3 policy matches, seed-locked results, player-side comparison, Wilson intervals, resource and move statistics, settings and JSON/CSV exports. Synthetic v0.1.2 roster simulations are intentionally disabled.
6. **Balance Experiments:** paired-seed 40/50/65 Defence constant sensitivity comparison to test directional hypotheses.
7. **Archive Explorer:** all twelve provisional first-generation forms with five-field stats, fixed Arts, Essence costs, relevant Ability Power and direct Archive citations. No final art or invented Aspect type chart.
8. **Evidence & QA:** versioned machine-readable evidence with source provenance, metadata-only structural inspection of Weave v0.1.2 Battle Reports, action summaries and QA/rules matrix, safe CSV export.
9. **Settings & Sources:** full JSON backup and restore, reset, rule profile selection, source links, data limitations.

## Run locally

This is a plain static ES-module app. No build step or paid API is required.

```bash
python3 -m http.server 8000 --directory site
# Then visit http://localhost:8000/
npm run verify
```

Browser screenshots and smoke checks require Python's `playwright` package and a Chromium browser. The optional `tests/browser-check.py` uses a local in-memory browser loader when navigation to localhost is blocked; it shims the browser worker and is **not** a replacement for deployed-site network testing.

### Publish to GitHub Pages

The workflow `.github/workflows/deploy.yml` runs `npm run verify` and, once **Settings → Pages → Source: GitHub Actions** is enabled, publishes the `site/` directory. Repository: https://github.com/Empyrios/weave-lab. The deployment workflow requests Pages enablement automatically. If repository policy prevents it, select GitHub Actions in Settings → Pages → Source and rerun the workflow. The expected app URL after successful deployment is https://empyrios.github.io/weave-lab/.

## Ruleset separation

| Detail | Released v0.1.2 | Approved v0.2 trial |
|---|---|---|
| Damage | `AP × ATK / (ATK + single DEF)` | `AP × ATK / (50 + relevant PHY.DEF or SP.DEF)` |
| Roster | Two real lines + four temporary prototype test kits in the release | Six canonical lines, twelve provisional forms |
| Reweave | Six held Threads | Four held Threads + one Move |
| Loom start | 3 markers | 8 markers |
| Loom marker max | 4 | 14 |
| Refill Thread chance | 12.5% | 35% |
| Post-Move marker floor | Not used | 6 |
| Held Thread cap | 6 | 6 |
| Turn size | 2 Moves | 2 Moves |
| Decision timer | 30 seconds | 30 seconds |

The v0.2 formula is approved in structure, but its smoothing constant and values remain subject to tuning. The all-six-Rewoven-by-six-minutes and 8–10-minute match-duration targets are aspirations, **not** confirmed performance metrics.

### Battle Simulator caveat

The synthetic model uses:

- Real names and provisional first-gen numeric profiles, rather than complete evolved effects.
- Simplified damage, Shield, Essence and Thread flows; no authoritative physical/special traits, reaction chains, Burning, curses, actual player choices or network timings.
- A fixed **20-second-per-Move assumed pacing** for modelled time, not measured human timings. It is normal for these outputs to diverge materially from the 8–10-minute design objective.
- Bounded action counts, reproducible seeds, common random seeds across experiment variants.
- **No semantic claim** that its win rates, time-to-KO or balance comparisons are the real Weave engine's win rates.

Proper parity testing requires a future read-only adapter to the exact Weave game version, in-engine replay of Battle Reports, and human playtests. Do not ship game balance changes based on synthetic results alone.

## Source provenance

- [Weave game engine](https://github.com/Empyrios/weave) (private)
- [Canonical Combat System](https://app.notion.com/p/3e43aaec5da18139857fd8a92a25e7df)
- [Core Loom Rules](https://app.notion.com/p/3e43aaec5da18170923df4159d3a2f04)
- [Balance Constants](https://app.notion.com/p/3e43aaec5da1819f90f8d75ebdf1f095)
- [Weaver Design](https://app.notion.com/p/3e43aaec5da1812cbda9edb2d946bcc4)
- Individual Archive sources appear in `site/catalog.mjs` and the Archive UI.

Sources were checked against available connected documents on 2 November 2026. Their values may be superseded later, and app updates should use an explicit change log, not silent auto-synchronisation.

## Privacy and safety

No authentication or backend. Settings and evidence remain in this browser's `localStorage`. This is not an encrypted secrets store, and using the same `github.io` origin can share browser storage with other sibling project pages. Do not paste passwords, API keys or sensitive personal data into Battle Report notes. Keep JSON backups privately. The app never connects to game accounts or deploys changes to Weave itself.

## Quality and release

`npm run verify` tests numerical fidelity, source invariants, game mode separation, match-three and thread invariants, draft uniqueness, deterministic simulation, evidence validation and CSV injection safeguards.

See `docs/ARCHITECTURE.md`, `docs/FIDELITY_MATRIX.md`, `docs/EXPERIMENT_PROTOCOL.md` and `docs/ROADMAP.md` for deeper developer documentation.

## v1.1 controlled research additions

- Study Desk: exact 10 × 25 × 4 schedule, SHA-256 nonce-zero candidate proposals explicitly marked unaccepted.
- Compare Runs: paired-seed synthetic exports, configuration mismatch checks and action deltas.
- Report Timeline: paginated, searchable original events and owner-side filtering.
- Private CLI: readiness gate, engine-selected initiative seeds, hashed accepted manifests, atomic checkpoints, replay comparisons, compressed report/event exports and stratified 2,000-block bootstrap.
- Fixed synthetic Rewoven Essence capacity and Turn counting. Model identity changed to synthetic-policy-v1.1. Human match duration is no longer presented in simulator analytics.

The exact canonical engine, policy implementation and per-kit metrics belong to the separately pinned private engine adapter. They are not supplied by this Lab. Read adapters/README.md before integrating. Metadata declarations are attestations requiring independent inspection. No canonical trial outcomes are included.

```bash
npm run experiment -- --proposal --out runs/readiness
# Expected exit 2: blocked without a qualifying engine; creates an unaccepted proposal.
npm run experiment -- --adapter /absolute/private/adapter.mjs --out runs/canonical
# Restart the identical command to resume. Changed manifests or metadata are rejected.
```

The app is buildless and portable: host site/ on GitHub Pages or any static HTTPS host. Private Sites hosting is a convenience, not an application dependency. No paid API is used. SHA-256 browser operations require a secure HTTPS context.

## v1.2 Investigation Studio

The Studio provides recorded-state visual replay, synthetic patch testing for HP/ATK/DEF/AP and Thread parameters, ten-partition matchup heatmaps with Wilson intervals, Weaver profiles, Reweave opportunity/death diagnostics, Essence overflow and Bonus Move chain logs. Defensive and setup policies supplement existing policies. They remain heuristic approximations of incomplete kits.

The QA register records evidence for all 36 Arts, 12 Traits and cross-kit fixtures. A local notebook attaches study exports, hypotheses and conclusions. A human stopwatch records real session and decision intervals, separately from synthetic action counts. Reproduction packages capture input configurations, errors and optional full traces. Snapshot traces use `weave-lab-trace-v1`; arbitrary engine reports do not magically gain missing snapshots.

Private packages use AES-256-GCM with a random salt and IV, PBKDF2-SHA256 at 250,000 iterations and a user passphrase. Share files through a private channel and communicate the passphrase separately. This is portable file exchange, not an authenticated submission server or cloud sync. Studio data uses a separate localStorage key and has its own backup export/import. Back it up before moving devices. No automatic Linear/GitHub issues or private source publication occur.

Exact v0.2 execution remains blocked: the available game main is v0.1.2. No canonical engine, verified kit tests, exact replay reconstruction, automatic action-sequence minimizer or remote private collector is claimed. The private adapter contract and execution harness are ready for a qualifying engine.

## v1.3 Planning & Validation

- Named, tagged uint32 seed bank, backup import/export, main Lab seed loading and worker-driven synthetic bank runs with retained errors and censored outcomes. Results are observations, not baseline regression assertions.
- Three-species composition summaries, base stat totals, role labels, damage categories, utility Arts and signature resource costs. An isolated first-damaging-Art matrix shows base-form damage coverage; complex effects are excluded.
- Statistical checker separates decisive, completed and all-scheduled denominators and computes Wilson intervals. Approximate independent sample sizes are explicitly separated from the controlled study's block-bootstrap method.
- Manual release-readiness checklist requires evidence references for passing gates. It neither certifies gameplay nor unlocks the exact engine gate. Planning data has a separate browser-local backup export.

## v1.4 Research Vault

Unified SHA-256-checked backup covers the four explicit browser stores: main settings/evidence, Studio, planning and study history. Imports are staged and inspected before confirmation. Restore replaces managed sections, downloads a recovery file first, reloads in-memory modules and attempts rollback if storage writes fail. Backups are plaintext; hash integrity is not an authenticity signature. In-memory traces and unfinished forms are excluded. New backup versions must be explicitly supported; no guessed migration is performed.

New completed batch, Loom, sensitivity, patch, matchup, trace and seed-bank studies are automatically archived with parameters, model label, app version and time. Forty results are retained, with a 2 MB serialized history limit; a storage failure is surfaced without discarding the completed study output. Trace history contains summary diagnostics only. Results can be filtered, inspected and exported.

The update manager checks a network-only version manifest and lets users apply downloaded updates after confirmation. Future service workers wait for activation; the v1.3-to-v1.4 transition auto-activates once because the older shell has no update UI. Cache deletion is restricted to Weave Lab cache names, and only known in-scope shell assets are cached. This is browser-local continuity, not automatic cloud backup or a guarantee against browser storage eviction.
