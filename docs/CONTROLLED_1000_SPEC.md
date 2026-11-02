# Weave Lab | Controlled Generation 1 v0.2 experiment

**Experiment ID:** `WL-V02-1000-001`  
**Status:** DESIGN ONLY, NOT EXECUTED  
**Master seed (unsigned 32-bit decimal):** `20261102`  
**Scheduled trials:** exactly **1,000**  
**Ruleset:** approved v0.2 Generation 1 gameplay, pinned to a precise, verified engine commit and ruleset fingerprint at execution time.  
**Purpose:** assess team-level balance, draft-first and Battle-first effects, resource economy, Reweaving opportunities, game length measured in actions/turns, kit interactions, and deterministic replay quality under a declared automated policy.

## 0. Execution readiness and source authority

**DO NOT RUN AS A CANONICAL FULL-ROSTER EXPERIMENT** until the selected v0.2 engine build includes all six species lines, 12 forms, 36 Arts, 12 Traits, complete exclusive snake draft, approved split-defence combat and rapid Reweaving, plus verified Battle Report serialization/replay. The released `Empyrios/weave` `main` commit `fba7149e66a826e0f1ca76e0040c5861eed0ba3f` is v0.1.2, not this v0.2 engine. As checked on 2 November 2026, PRs #6–#11 are open and HYP-20/HYP-54 remain Todo. The complete roster is an acceptance gate, not an assumption.

Authority: current [Combat System](https://app.notion.com/p/3e43aaec5da18139857fd8a92a25e7df), [Core Loom Rules](https://app.notion.com/p/3e43aaec5da18170923df4159d3a2f04), [Balance Constants](https://app.notion.com/p/3e43aaec5da1819f90f8d75ebdf1f095), and individual canonical Archive 01–12 pages. Implementation evidence and release gate: [HYP-20](https://linear.app/hypweave/issue/HYP-20), [HYP-54](https://linear.app/hypweave/issue/HYP-54), [HYP-69](https://linear.app/hypweave/issue/HYP-69), [HYP-80](https://linear.app/hypweave/issue/HYP-80). Experimental policy choices below are *not* canonical rules.

## 1. Research questions, in order

1. Across all legal six-species partitions, what is the observed team win probability under the specified automated policy?
2. Is draft-first assignment or independently selected first Battle Turn associated with a detectable advantage?
3. How much resource generation is lost to Essence Capacity and the six-Thread player cap?
4. How often does each form Reweave, and how many Turns and Moves elapse before these events?
5. Are there systematic stalls, disproportionately long battles, runaway Bonus Move sequences, or anomalous kit interactions?
6. Which effects, Arts and Traits are used, what are their measured effects, and which require targeted regression tests?

Do not infer a true competitive human win rate, actual human match duration in minutes, or proven balance solely from scripted-agent outcomes.

## 2. Fixed experimental population

Species IDs, in this **specified order**:

`[fjordfin, craglet, kilnix, budwyrm, ruklet, mothrit]`.

Each match uses all six species exactly once. The three species on one team exclude the three on the other. Reweaving changes a species' form, not its draft identity or Aspect. The current six-line roster therefore provides exactly 20 labelled allocations, or 10 complementary unordered matchups.

Construct the 10 partitions deterministically: anchor species `fjordfin` on **Team X**, enumerate all lexicographically indexed two-element combinations of `[craglet, kilnix, budwyrm, ruklet, mothrit]` using the order above, and put the remaining three on **Team Y**. Number partitions `P01` through `P10` by that combination order. Team X is just a reporting label, not an advantage or a real player identity.

| Partition | Team X | Team Y |
|---|---|---|
| P01 | Fjordfin / Craglet / Kilnix | Budwyrm / Ruklet / Mothrit |
| P02 | Fjordfin / Craglet / Budwyrm | Kilnix / Ruklet / Mothrit |
| P03 | Fjordfin / Craglet / Ruklet | Kilnix / Budwyrm / Mothrit |
| P04 | Fjordfin / Craglet / Mothrit | Kilnix / Budwyrm / Ruklet |
| P05 | Fjordfin / Kilnix / Budwyrm | Craglet / Ruklet / Mothrit |
| P06 | Fjordfin / Kilnix / Ruklet | Craglet / Budwyrm / Mothrit |
| P07 | Fjordfin / Kilnix / Mothrit | Craglet / Budwyrm / Ruklet |
| P08 | Fjordfin / Budwyrm / Ruklet | Craglet / Kilnix / Mothrit |
| P09 | Fjordfin / Budwyrm / Mothrit | Craglet / Kilnix / Ruklet |
| P10 | Fjordfin / Ruklet / Mothrit | Craglet / Kilnix / Budwyrm |

## 3. Exactly 1,000 trials

For each partition `P01..P10`, use replicate blocks `R01..R25` (25). Each block has these four conditions:

| Arm | Draft-first team | First Battle Turn |
|---|---|---|
| OX-IA | X | Draft-first player A |
| OX-IB | X | Other player B |
| OY-IA | Y | Draft-first player A |
| OY-IB | Y | Other player B |

Total `10 partitions × 25 blocks × 4 arms = 1,000 matches`. Each partition therefore receives 100 matches; every *labelled* draft allocation receives 50; each combination of labelled allocation and Battle-first condition receives 25. Across the full experiment, 500 battles start with A and 500 with B, and each team has equal opportunity to draft first. A is the first-draft role and is mapped to an actual player seat by the engine's independently random draft-first selection. Record both physical seat IDs and role assignments.

Draft sequence must obey `A → B → B → A → A → B`, with each chosen team filling its own assigned species set. Within each team's set, choose species in the fixed six-ID list order; the resulting sequence is legal and unambiguous. All six choices are submitted as valid, immediately confirmed picks. No draft timer expiry is deliberately induced in the main 1,000 trials; test timeout and fallback with separate deterministic fixtures.

**Important:** These four arm conditions are a controlled, 2×2 stratification. Do not implement an undocumented forced-first-player gameplay change. Preserve the canonical independent RNG draws for draft-first and Battle-first, and use deterministic seed selection (below) to obtain the desired Battle-first condition relative to the draft-first role. Record the selection mechanism in the manifest. If the selected engine cannot expose or validate these conditions, block execution rather than silently modifying gameplay RNG.

## 4. Exact reproducible seed-generation algorithm

A master seed is **not** a claim that the next 999 engines can use `20261103` onward. Generate every candidate using the following language-neutral specification:

1. Iterate in the fixed order: `P01..P10`, then `R01..R25`, then arms `OX-IA`, `OX-IB`, `OY-IA`, `OY-IB`.
2. For each arm set integer `nonce=0`.
3. Construct ASCII string exactly: `weavelab:v02:1000:master=20261102:partition=PXX:replicate=RXX:arm=ARM:nonce=N`, where `PXX` and `RXX` are two-digit zero-padded labels, `ARM` is one of the four exact IDs above and `N` is an unpadded base-10 nonce.
4. Compute SHA-256 over the UTF-8 bytes. Read bytes `0..3` of the digest as one **unsigned little-endian 32-bit integer**. This is the candidate engine seed, including zero if generated.
5. Reject candidate seeds already used for another accepted trial. Reject if the *canonical* engine's draft/initialisation flow does not produce the required first Battle Turn relative to the actual first-draft role. Increment nonce and retry with identical rules otherwise.
6. Accept the first candidate meeting both criteria. Save the full candidate string, nonce, decimal seed and hex seed in the manifest.
7. Never replace a seed because its completed result was unfavourable, unusually long or a draw. Rejection is allowed **only before gameplay** for the prescribed initiative stratum or duplicate-seed avoidance.

Acceptance must exercise the exact pinned engine's normal independent draft/initiative RNG, not a stand-in random coin. Avoid consuming gameplay RNG just to score decision candidates. Maintain deterministic iteration and stable engine/runtime versions. If the engine uses separate RNG streams, record the exact stream identities. For any future paired baseline/candidate patch test, document any resulting RNG divergence; identical seeds alone do not prove identical random sequences across different rulesets.

Match ID: `WL-V02-1000-001/PXX/RXX/ARM`; all IDs are unique. A fully materialised 1,000-row manifest is produced *before* the first action is taken. Store a SHA-256 digest of a canonically serialized manifest (sorted property names and explicitly specified number formatting), excluding its own digest field.

## 5. Canonical v0.2 baseline (do not alter)

- 3 vs 3 Weavers; all six distinct species used; visual triangular positions have no universal gameplay modifiers.
- 7×7 shared Loom; six equally likely Aspects; legal orthogonal swaps may be non-matching; matches of 3+, intersecting groups counted by unique Strands; gravity/refill/cascades/reshuffle.
- 2 mandatory base Moves per Turn; swap, Art or Reweave costs 1 Move. No voluntary pass/end turn or surrender. Each completed Move with at least one 4+ unique-Strand Weave earns exactly 1 Bonus Move; Bonus Moves may chain without a universal cap.
- 30-second player decision timer. Scripted policy always commits immediately; real-time countdowns and timeout swaps are separately tested and are *not* evidence of observed human decision time.
- Each living ally matching a removed Strand's Aspect gains 1 Essence, subject to individual capacity; track excess/overflow precisely. Dead units gain none; defeat destroys held Essence.
- Starting Threaded Strands = **8**; maximum Threaded Strands present = **14**; refill Marker probability = **35%** while under cap; after each fully resolved ongoing Move, refill Threaded-Strand density to at least **6** when below. Player-held Threads cap = **6**, each removed Threaded Strand grants one to active player, excess discarded.
- One Reweave costs **4 shared player Threads + 1 Move**, requires a living, eligible Base Form, spends exactly 4 and retains excess. Rewoven Forms cannot Reweave again.
- Damage uses `rounded((AP × effective ATK)/(50 + relevant effective PHY.DEF or SP.DEF))` for regular Physical/Special hits, applying the actual engine's sequencing, minimum, shields, statuses, True Damage and fixed damage rules. The Defence smoothing constant is 50. No global Aspect type-advantage multiplier exists.
- All **12 canonical form records**, **36 Arts**, **12 Traits** and their per-hit damage categories, conditional mechanics, statuses, target restrictions, Rune interactions, Burn, Heat, Bud Heads, curses, shields, dispels, revival and dynamic effects must come from the pinned canonical approved provisional data.
- Legal results: one team eliminates the other; same-chain double elimination is a draw. No sudden death, hard match-time cap or arbitrary in-game victory after a simulation safety stop.

These numbers are approved *trial baselines*, not claims of final balance. No Art, HP, Defence, Essence, Shield, status or Trait retuning is permitted within this experiment.

## 6. One fixed, disclosed automated decision policy

Use the **same** policy on both sides: `deterministic-policy-v1.0.0`. It must choose legal actions from a read-only snapshot, never mutate or advance the engine RNG during candidate evaluation, and never use hidden refills or future enemy information.

1. **Mandatory choice:** if an engine-owned Trait or continuation choice is pending, select a legal option with the smallest target HP/max-HP ratio; break ties by formation slot then stable Weaver ID. If the choice isn't about a target, choose the engine's first documented legal option.
2. **Reweave:** if the side has at least 4 Threads and any eligible living Base Form, choose the eligible Weaver with lowest current HP/max HP, tie by formation slot then ID. Attempt its legal Reweave.
3. **Damage Art:** examine only engine-legal, Essence-affordable, currently targetable damaging Arts. Choose the candidate with highest Art index (signature first), then lowest actor formation slot, then target with smallest current HP/max HP, then target slot and ID. For required Loom lines, take the lowest legal line index and the lowest legal direction in documented order. The engine decides all effect outcomes. If no such candidate exists, continue.
4. **Utility Art:** use a legal healing/revival/shield Art only when it targets a dead ally for revival or a living ally with HP/max HP ≤ 0.5, prioritizing revival then lowest HP fraction, then lowest actor slot and Art index. Skip all other utility Arts in this baseline policy; explain that this leaves some kit strategies underused.
5. **Swap:** enumerate all orthogonal adjacent pairs `(a,b)` with `a < b`, sorted row-major. On a *copy* of the current board, count immediate unique matched Strands from the hypothetical swap without resolving gravity/refills/cascades or touching live RNG. Select the swap maximizing, in order: (i) immediate 4+ Weave present (1/0), (ii) number of immediately matched active-team Aspect Strands, (iii) immediately matched Threaded Strands, (iv) total immediately matched Strands; tie-break by smallest `a`, then `b`. If there are no immediate matches, take the smallest legal pair. Execute with the actual engine.
6. Never voluntarily surrender, pass or bypass remaining Moves. If the engine rejects an action that this policy identified as legal, count a **policy/engine consistency error**, do not silently select a replacement. If no legal action exists in a state requiring a Move, mark a validity failure.

This is a deliberately basic **greedy policy**, not a competitive AI agent. It may be biased toward signature Arts or early Reweaving, and it will underexercise setup-focused kits. The 1,000-match results are conditional on this exact policy. Follow-up separate policy-sensitivity experiments must be run before making any player-balance judgement. Record policy source commit and hash.

## 7. Engine execution and stopping conditions

- Take an immutable snapshot and engine/report fingerprint before each match.
- Simulate exactly one engine-accepted decision at a time; process all reactions, Cascades and mandatory sub-decisions according to engine order.
- Preserve all committed actions and derived events in versioned Battle Report output.
- If a normal victory or same-chain draw is reached, record it and stop.
- Safety limit: **2,000 accepted Move-consuming actions per match**. If reached without a canonical result, mark `incomplete_action_limit`, **not** draw or win. A pathological engine resolution/non-terminating cascade is an engine error, not an in-game result. This is a laboratory bound, never a v0.2 gameplay rule.
- A worker watchdog may terminate a hung process, marking `infrastructure_timeout`; never promote it to a player defeat or draw. Environment-specific timeouts and retry history must be reported.
- Do not substitute newly chosen seeds for failed/incomplete games. Preserve exactly 1,000 scheduled trials and all outcomes, including error and incomplete categories.
- Use worker threads or processes for batch execution; deterministic *result* must be independent of worker count. Collect and aggregate by fixed match ID order.

## 8. Exact metrics and definitions

Collect raw per-event and derived per-match values, with typed actor/source/target IDs. No regex parsing of UI text.

### Identity and correctness

`match_id`, partition, original Team X/Y species sets, physical seats, draft-first role/seat, Battle-first role/seat, exact draft pick sequence, seed/nonce, engine commit, ruleset fingerprint, policy version, completed/winner/draw/incomplete/error reason, replay status.

### Turn and Move economy

Count completed engine **Turns**, accepted Move-consuming actions, swaps, nonmatching swaps, Arts, Reweaves, timeout swaps (expected zero in the baseline), granted Bonus Moves, spent Bonus Moves, 4+ qualifying Move resolutions, maximum consecutive Bonus Move chain, Loom reshuffles, total Cascade steps, groups by Weave length (3, 4, 5+), and unique Strands removed. Attribute all events to the correct owning/acting side.

### Essence

Per Weaver and per side: Essence awarded by matched Aspect Strands, Essence gained by kits, spent on Arts, transferred, drained, lost at capacity overflow, lost at defeat, and remaining at result. Distinguish capacity clipping and any explicitly permitted overflow exceptions from the canonical kit specifications.

### Threads / Reweaving

Per side: Threaded Strands removed, Threads awarded, capped/discarded Threads, Threads spent, Thread Marker attempts and successful placements, Marker density after every resolved Move, Reweaves attempted/completed, identity of every Rewoven form, first Reweave at accepted-Move index and Turn, whether each living eligible form had a legal opportunity to Reweave before the match ended, and whether all six Rewove. At end, record unrewoven forms with reason: defeated, no opportunity, policy skipped, or match ended.

### Damage and effects

Per Art, hit and owner: source/target, damage category, AP including conditionals, effective ATK/DEF at resolution, raw/rounded damage, Shield reduction, actual target HP removed (exclude overkill), HP healing, life leech, Shield grant, mitigation, True/Fixed flags, statuses applied/cleansed/triggered, relevant stacks and reactions. Count actual triggered Trait effects and Rune activations by **Rune source/owner**, not simply by acting Team. Reject incomplete attribution as a known data-integrity issue; see HYP-80.

### Results and performance

Team X win / Team Y win / draw / incomplete rates; draft-first and Battle-first win proportions; per-partition results; survivorship (each form), completed Turn and accepted-Move distributions, engine processing time (performance metric only), peak worker memory, per-match max-action-limit incidence, invalid states and exact replay parity.

**Do not report synthetic match length in real-life minutes.** The 8–10-minute battle aspiration and six-Rewoven-by-minute-six aspiration require actual observed player decision and animation timing. A purely computational engine processing-time measurement is not a proxy for match duration. Optional human timed playtest data must be separately sourced and labelled.

## 9. Statistical analysis plan

- Primary endpoint: observed Team X win probability per partition, with explicit draw/incomplete rate. Each partition has 100 scheduled trials, balanced by draft assignment and Battle-first role.
- Overall side-effect endpoint: `P(draft-first wins) − P(second-draft wins)` across 1,000 scheduled matches, plus draws and incomplete results separately. Report the same for Battle-first versus Battle-second. Never silently drop unfinished games.
- Secondary: form usage, survivor frequencies, timing in Moves/Turns, resource/Art/bonus distributions and effect attribution.
- Describe each denominator. For outcome rates over completed matches show both `completed-only` and `all-scheduled` denominators; do not use a completed-only result if completion is systematically selective without warning.
- Calculate point estimates with fixed, equal weights across the ten partitions and four arms. Do not pool unmatched policy variants or older v0.1.2 proxy data.
- Confidence intervals: **2,000 stratified block-bootstrap samples**, preserving all four arms within a `partition × replicate` block. For each bootstrap sample and each partition independently sample 25 of its 25 blocks with replacement, and aggregate the selected four-arm blocks. Bootstrap random draw `i` deterministically using the first 8 bytes of SHA-256 of the UTF-8 string `weavelab:v02:bootstrap:20261102:b=B:p=PXX:draw=D`, interpreted unsigned little-endian modulo 25, with `B=0000..1999`, `D=00..24`; percentile interval is 2.5th/97.5th, Type-7 linear interpolation. Record the exact computational algorithm and code version.
- For labelled-allocation rates (n=50) also show a Wilson 95% interval on the completed trial proportion when appropriate, and warn about low per-cell precision (each initiative cell n=25).
- Use a two-sided 95% interval for advantage estimates; do not promote an estimate to proof of fairness, or interpret a non-significant effect as evidence of zero effect.
- For skewed metrics, show median, 10th/90th percentiles and interquartile range; also mean where meaningful. State handling of incomplete matches, with no invented elapsed-time values.
- Treat multiple matchup/Art comparisons as exploratory; do not issue conclusive rankings based solely on 1,000 greedy-policy matches.

## 10. Verification and gates

### Before batch execution

1. Verify 6 unique species lines, 12 canonical forms, 36 Arts, 12 Traits, their stats/damage categories, current approved rule constants, legal targeting, exclusive draft and complete v0.2 engine implementation.
2. All locked-install tests, typecheck and production build pass at the **exact pinned commit**. Record commit SHA, dependency lock SHA-256, Node version and OS/runtime details.
3. Deterministic fixtures pass for: 20 labelled allocations, 10 complementary partitions, legal snake pick sequence and 10-second draft timeout fallback, independent draft-first/Battle-first, canonical v0.2 damage, 4/5/6 Thread Reweaving spends, Marker cap/floor, Cascade counting, capacity/overflow, simultaneous defeat draw, every Art and Trait, and cross-kit interactions.
4. Specifically include a regression for **HYP-80 Rune ownership**: a Rune triggered on an opposing Turn must credit its source Weaver/team, not the active actor.
5. Verify seed-schedule determinism, unique 1,000 IDs, exactly 25 trials for each partition×orientation×opener cell, and identical serialized outputs from 1-worker versus multi-worker modes for a representative subset.
6. Document any conditional model, missing mechanic, unsupported Art, stale Wiki value or omitted effect. **If any required mechanic is absent, block the canonical 1,000-match experiment.** It is permissible to run a differently named exploratory proxy; never label it this experiment.

### During and after

- Every accepted action must be engine-legal; 0 state invariant failures, 0 hidden RNG consumption by the policy, 0 unknown effect owner IDs, and no unsupported action replacement.
- Serialize a versioned Battle Report for all 1,000 trials, including incomplete ones up to their truncation point, subject to existing schema constraints.
- **Reconstruct/replay every result** using the exact engine revision and compare canonical final snapshots and event histories byte-for-byte after defined canonical serialization. Failed exact replay invalidates the corresponding result and is a run-level QA failure. Do not normalize away discrepancies to make replays pass.
- No substitution of failed trials, no arbitrary draw conversion, no silent dropping of partial games.
- Report actual completed count and censoring reasons; if fewer than 990 of 1,000 reach a canonical finish, mark aggregate win-rate conclusions *low reliability* and investigate stalls or policy flaws before drawing balance conclusions.
- QA failures, missing roster coverage, a broken source attribution path, mismatched fingerprints or replay failures block classification as verified canonical v0.2 evidence, even if most matches finish.

## 11. Required output bundle

1. `experiment-manifest.json`: experiment ID, master seed, acceptance procedure, full 1,000 rows and nonces, SHA-256 integrity hash, pinned engine/ruleset/policy build IDs, environment information.
2. `match-results.csv`: one line per scheduled match, exact IDs, teams, controlled conditions, seed, winner, finish status, Moves/Turns, resource and Reweaving summary. CSV-escape and spreadsheet-formula-sanitise external values.
3. `match-events.jsonl.gz`: typed source-attributed events, keyed by match ID and stable event index.
4. `battle-reports.jsonl.gz`: engine-compatible full reports and revision/fingerprint for deterministic replay; do not expose private internal game code or secrets in public artifacts.
5. `summary.json`: definitions, denominators, aggregate metrics, 10 matchup summaries, 20 labelled allocations, 2×2 factorial effects, intervals, sample-size and coverage limits.
6. `replay-verification.json`: attempted, successful and failed exact replays, mismatches with first differing path.
7. `qa-report.md`: source evidence, rule/version reconciliation, tests, discovered failures, statistical caveats, environment/performance, and explicit readiness gate.
8. `balance-report.md`: key findings, uncertainties, suspicious interactions, reproducible match IDs, and next investigation recommendations; no automatic numeric changes or release approval.

Use `run_status=BLOCKED_ENGINE_INCOMPLETE` until the prerequisite exact v0.2 implementation is available. Do not populate outcome data, pretend that all 1,000 matches ran or fabricate a win-rate chart. When runnable, move through `READY → RUNNING → VERIFIED/FAILED_QA` based on recorded evidence.
