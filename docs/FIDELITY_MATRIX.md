# Weave Lab fidelity matrix

Status legend: **exact subset** means the algorithm matches that isolated documented rule; it does not imply match-engine parity. **Approximation** means model assumptions are not confirmed engine implementation. **Not implemented** means no capability is claimed.

| System | Lab implementation | Evidence grade | Key constraint |
|---|---|---|---|
| Normal damage | AP × ATK / correct version denominator, nearest integer | Exact isolated formula | Universal stat modifiers and effects not all implemented |
| Physical/Special | Uses relevant PHY.DEF or SP.DEF | Exact isolated formula | Target stats are provisional |
| True Damage | Bypasses Shield; Fortress/Bedrock immunity converts to normal | Exact isolated math | Complex reactive chains not simulated |
| 7×7 Loom | Six Aspects, orthogonal swaps, 3+ horizontal/vertical | Exact documented subset | Special Strands and full kit manipulation omitted |
| Intersections | Merge overlapping runs, count unique Strands | Exact documented subset | Colliding special effects omitted |
| Cascades | Removal, gravity, refill, repeat until stable | Exact documented subset | Full v0.2 integration pending |
| Thread marker trials | Seeded caps/chances/floor under selected profile | Approximation of configured trial | RNG event order can differ from actual game code |
| Bonus Move | One flag per completed Move with a 4+ group | Exact isolated rule | Other Art-granted Moves not represented |
| Snake draft | A–B–B–A–A–B, exclusive picks | Exact documented subset | Real timer and network protocol excluded |
| Full v0.2 Battle | Simplified 3v3 policy loop | **Synthetic hypothesis only** | No live conclusions or parity claim |
| v0.1.2 roster Battle | Disabled | Deliberately unavailable | Released prototype uses different roster |
| Combat Art effects | Damage/Shield approximations | Approximation | Trait triggers, curses, Heat, Bud Heads etc not modelled fully |
| Battle time | 20s modelled per Move | Assumed pacing | Not observed human or PvP telemetry |
| Seeded simulation | Repeatable seed + parameters | Exact tool determinism | Deterministic but model-biased results |
| Battle Report import | Structural metadata/summary | Partial forensic | Not an engine replay or authenticated report |
| Evidence registry | Versioned JSON, provenance, local checksum | Tool-generated audit trail | Checksum not cryptographic or server-signed |
| Real gameplay parity | Not implemented | Not verified | Requires exact pinned engine and tests |

### Release acceptance conditions

- CI passes on exact commit.
- Mobile/desktop interactive browser tests pass with no overflow and no JavaScript exceptions.
- Current model version disclosed.
- Source and experimental assumptions disclosed.
- Exported studies have seeds and parameters.
- No game engine source files changed by Lab staging.

## v1.1 additions

| System | Status | Limit |
|---|---|---|
| Trial schedule | Implemented and tested | Proposals are not engine-accepted seeds |
| SHA-256 manifest and checkpoint | Implemented and tested | Integrity is not an authenticity signature |
| Engine adapter / exact policy | Contract and runner supplied | Canonical v0.2 adapter is unavailable |
| Block bootstrap | Implemented, 2,000 stratified resamples | Requires all 1,000 rows, including censored trials |
| Exact replay gate | Canonical serialized event/snapshot comparison | Uses externally supplied pinned engine adapter |
| Report event explorer | Implemented | Structural inspection only |
| Paired synthetic comparisons | Implemented | Same seed does not guarantee equal RNG paths |
