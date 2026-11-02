# Private engine adapter contract

No qualifying v0.2 engine is included or invented. The default branch of Empyrios/weave identified itself as 0.1.2 when checked on 2 November 2026. Keep private engine code outside the deployable `site/` directory.

Export one default adapter object from a local `.mjs` module. The CLI dynamically imports it only when explicitly supplied. Metadata is a declared attestation, not independent proof of canonical completeness. Lab tests do not certify engine mechanics.

- `metadata`: `version: '0.2'`, full 40-character `commit` and `policyCommit`, 64-character SHA-256 `rulesetFingerprint`, `lockHash`, `policyHash`, and `policyVersion: 'deterministic-policy-v1.0.0'`.
- `metadata.constants`: exact values exported as `CONSTANTS` by `site/protocol.mjs`.
- `metadata.coverage`: `{species: [...six exact IDs], forms:12, arts:36, traits:12, complete:true}`. Completeness includes all conditional kit mechanics, statuses, revival and reactions.
- `metadata.fixtures`: each `REQUIRED_FIXTURES` key maps to `{passed:true,evidence:'immutable artifact or test reference'}`.
- `metadata.checks`: `{test:true,typecheck:true,build:true}` for the pinned commit and locked dependencies. Also record OS, Node version and stream identities in metadata.
- `initialize({seed,row,makeDraftPlan})`: use the actual engine independent draft-first draw; submit `makeDraftPlan(draftFirstSeat)` through the normal exclusive draft; use the actual independent Battle-first draw. Return `{draftFirstSeat,battleFirstSeat}`. Do not replace either draw or play a Move.
- `play({row,maxAcceptedMoves,policyVersion})`: recreate the accepted initial state, verify both seats and draft, choose actions using section 6 of the experiment specification. Return `{seed,engineCommit,rulesetFingerprint,status,winner,moves,turns,qaPassed,metrics,events,report,finalSnapshot}`. Winner is X, Y, draw or null; incomplete states never become draws. `metrics` must carry the source-attributed resource, effect, Reweave and per-form data required by the protocol. Every event has `kind`, `ownerSide:0|1`, and a stable `sourceId`. Do not evaluate moves using live RNG, replace rejected policy actions or override mandatory choices.
- `replay({row,report})`: re-run using the pinned engine report implementation and return `{events,finalSnapshot}`. Lab compares canonical JSON byte for byte. Return full history for incomplete reports too.

Run `node scripts/run-experiment.mjs --adapter /absolute/private/adapter.mjs --out runs/study`. Manifest is saved before gameplay. Atomic checkpoints permit restarting the same command. A changed fingerprint or checkpoint is rejected. SIGINT pauses after the current match. Adapter.play must enforce resolution watchdogs internally; untrusted adapters execute code with your user's permissions.

Before supplying an adapter, implement and inspect all fixtures, the fixed decision policy and complete required metrics. The Lab cannot derive an exact engine adapter from the simplified synthetic simulator. The browser never imports this adapter.
