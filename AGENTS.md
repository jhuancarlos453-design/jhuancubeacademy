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

- Use one root AppProvider for account state and Cloud-backed training data; a single identity-transition listener prevents competing sessions and subscriptions.
- Private app data must be owner-scoped through RLS; never use the legacy local session or stored password as authorization.
- Preserve legacy browser records and offer explicit validated, non-destructive merging only after verified Cloud sign-in with the same email.
- Persist training payloads with revision-checked serialized writes; reject conflicts rather than silently overwriting another device's changes.
- Validate training payloads through the shared runtime schema before imports, rendering or writes; this prevents malformed backups from corrupting the app.
- Daily challenge rewards and per-day quiz counters live in the existing validated training payload; derive XP from unique awarded local dates and award through the serialized revision-checked update to avoid duplicate claims without another table.
- The Cube Music playlist section was removed at the user's request; keep spotifyTrackUrl validation in the training schema so legacy personal-track payloads still load without any music UI.
