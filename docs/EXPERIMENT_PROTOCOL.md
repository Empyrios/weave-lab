# Weave balance experiment protocol

## Why repeatable experiments matter

Seeded simulations are useful for identifying unintended consequences, not establishing player experience. Monte Carlo samples must be compared at identical patch/parameter baselines, with one intervention at a time. Changes in team composition, AI policy and RNG draws can mask differences in a chosen parameter.

## Study A: Damage-pacing sensitivity

- Keep canonical roster and Art Power values fixed in the Lab.
- Use a consistent target with known HP and relevant PHY.DEF or SP.DEF.
- Compare DEF smoothing constants **40, 50, 65**, with 50 as the approved trial default.
- Record raw damage, Shield absorption and actual HP damage.
- Assess routine Art damage near the published soft bands (setup 8–15%, standard 15–25%, strong 25–35%, finisher 35–45%).
- **Do not** treat these soft bands as hard constraints. Test multi-hit, retaliation and exceptional finishers separately.

## Study B: Rapid Reweaving economy

- Baseline: 6 held Thread cap, 4 Thread Reweave cost + 1 Move, 8 starting Loom markers, 14 Loom cap, 35% marker-on-refill, post-Move minimum 6 markers.
- Generate seed bank, capture marker distribution, Threads collected, overflow and number of productive swaps.
- Compare to released v0.1.2 6-Thread cost/3 starting/4 cap/12.5% when appropriate **without** mixing legacy kits or damage formulas.
- Move the hypothesis to exact engine QA before claiming that all six Weavers can Reweave by minute six.

## Study C: Match pacing and fairness

- Use an independent seed stream or common seed conditions for paired cases.
- Control team roster, draft pick sequence, initiative and policy.
- Record two-Move burst, bonus-chain incidence, Essence accessibility, number of cast opportunities, HP survival, percentage of spent Threads lost to overflow, player-side win count and unfinished move-capped matches.
- Report a Wilson 95% interval for the observed **synthetic** side win share, excluding draws from the denominator.
- Where a confidence interval is wide, do not infer fairness.
- Collect human time-to-decision and full match completion data separately; the Lab's 20-second modelled Move is a placeholder assumption.

## Quality checklist

- [ ] Hypothesis stated before data inspection.
- [ ] Ruleset version and numeric checksum/fingerprint recorded.
- [ ] Seed range, sample size, both teams and policies stored.
- [ ] Exactly one primary balancing variable altered.
- [ ] Synthetic and exact-engine results clearly separated.
- [ ] No premature release decision from one metric alone.
- [ ] Counterplay and player decision quality assessed qualitatively.
- [ ] Findings mapped to original Linear work items instead of duplicating queues.

## Existing Linear owner map (context, not a status update)

- `HYP-20`: v0.2 full-match release gate.
- `HYP-26`: seeded battle playtesting and decision quality.
- `HYP-43`: damage formula and smoothing 40/50/65 validation.
- `HYP-44`: provisional split-defence/roster diversity.
- `HYP-46`: pacing and Rewoven spike targets.
- `HYP-62`: Aqua kit validation evidence; not the full Generation 1 roster.

This Lab does not create or update Linear issues automatically.
