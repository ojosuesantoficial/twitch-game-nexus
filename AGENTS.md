<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## MVP architecture
- Keep demo rewards in a typed browser-safe engine and React provider; never connect demo mutations to real auth or Twitch proofs.
- Use separate public TanStack content routes with shared shell and leaf metadata; this keeps every MVP surface navigable and shareable.
- Treat admin and OAuth screens as explicitly labeled demonstrations until a backend verifies sessions, roles and signed Twitch events.
- Keep product artwork bundled locally and illustrative; catalog edits live in React state for this explicitly frontend-only MVP.
- Use the shared Radix-backed DemoDialog for demo modals so focus trapping, Escape dismissal and focus restoration remain consistent.
- Derive demo wallet totals from an auditable ledger and test mutation boundaries separately from route matching to prevent silent accounting regressions.
