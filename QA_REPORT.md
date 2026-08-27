# Sport Portal QA Report

## Confirmed Issues Logged Before Fixes

### Backend Bug
- **Friend requests:** Any authenticated user could accept, reject, or delete any friendship by ID. Expected only the recipient to accept/reject and either participant to remove it.
**Fix:** enforce ownership and pending-state checks in the friendship controller, and return 404 for nonexistent targets.

### Business Logic Bug
- **Team deletion:** The team captain could approve a `TEAM_DELETE` request intended for club-owner approval.
**Fix:** restrict `TEAM_DELETE` approval to the owning club admin.

### Frontend Bug
- **Club leave:** The UI still reported “Club leave request sent” after leave became immediate.
**Fix:** update the success message and refresh membership state.

### Frontend Bug
- **Teams list:** Existing teams had no request-to-join action despite a working backend flow.
**Fix:** expose the existing request action in the list where the page is reachable.

### Frontend Bug
- **Friend and club chat components:** Unused `onClose` props caused lint failures and dead component API surface.
**Fix:** remove unused destructured props while retaining caller compatibility.

### Frontend Bug
- **Events and Friends effects:** Data loaders were omitted from effect dependencies, creating stale closures and lint warnings.
**Fix:** stabilize loaders with `useCallback` and declare their dependencies.

### Backend Bug
- **Friend target validation:** A nonexistent user ID could reach a database cast error instead of returning a clear 404.
**Fix:** validate the target user before creating the friendship.

### Frontend Bug
- **Teams URL selection:** Mongo ObjectId values were parsed with `parseInt`, so `clubId` URLs could not select the requested club.
**Fix:** compare IDs as strings.

### Frontend Bug
- **Teams list join action:** The legacy Teams page did not expose the existing team join-request endpoint.
**Fix:** add the request action with clear pending feedback.

## Test Evidence
- Frontend `npm run lint` passes with zero errors and warnings.
- Frontend `npm run build` passes. Vite reports only the existing chunk-size warning.
- Backend controller syntax checks pass.
- `backend/scripts/test_team_authorization.mjs` passes all authorization assertions: 200/401/403 outcomes match expectations.
- Temporary QA teams are created with `QA ... Temp` names and deleted in the script `finally` block; no permanent test IDs were added.
- A post-test database count check was attempted but blocked by MongoDB SRV DNS `ECONNREFUSED`; the integration script itself completed and ran its cleanup block.

## Needs My Input

- None confirmed yet.
