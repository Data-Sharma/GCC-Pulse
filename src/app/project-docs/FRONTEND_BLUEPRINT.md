# GCC Pulse Frontend Blueprint

## User roles for prototype
Primary: a GCC strategy/expansion researcher. Secondary views are not separate role portals in this MVP.

## Navigation
- Overview
- GCC Registry
- City Intelligence
- Expansion Radar
- Providers
- AI Extraction
- Claim Review

## Page contracts
### Overview
- Show dataset counts, never claimed total-market counts.
- Route users to main data surfaces.
- Surface database errors in human-readable form.
### Registry
- Search by company name.
- Show parent organization and industry.
- Link records to detail page by UUID.
- Empty state explains that the database may not yet contain records.
### Company profile
- Display company metadata.
- List linked locations and their status.
- Display evidence claims, exact supporting quote, source title, URL, publisher and date.
- Unknown values must be presented as unavailable, not zero.
### City intelligence
- Show metric value, unit, definition, period, and source.
- Avoid aggregate city ranking until methodology and data comparability are defensible.
### Provider explorer
- Show provider categories, public website, description, and evidence notes.
- Do not assign unsupported quality ratings.
### Expansion radar
- Distinguish unreviewed, potential, confirmed, and rejected signals.
- Display source context for each signal.
### AI extraction
- Accept pasted text rather than fetching arbitrary user URLs.
- Limit input length.
- Return structured candidate claims.
- Allow edits before persistence.
- Require reviewer token for prototype write.
### Claim review
- Load pending claims only after reviewer authorization.
- Allow approve/reject.
- Replace temporary token with authenticated user roles before public launch.

## Accessibility
- Use semantic page headings and visible form labels.
- Use buttons for actions and links for navigation.
- Expose errors through `role=alert`.
- Keep visible focus indicators.
- Never use color alone for review status.
- Ensure tables can scroll on narrow displays.

## Frontend data states
For every database-backed view, support:
- Loading
- Loaded with rows
- Loaded with no rows
- Failed query
- Partially documented record

## Trust and provenance UI
Every source-supported assertion should reveal:
- Source title
- Publisher
- Source URL
- Publication date, if known
- Retrieval timestamp
- Evidence quote
- Review status
- Uncertainty/limitations

## Visual direction
- Neutral canvas and white cards.
- One blue accent for primary actions and links.
- Compact navigation and high information density.
- Strong hierarchy for titles, counts, table labels, and source metadata.
- Avoid fake metrics, lorem ipsum, or invented provider rankings.

## MVP acceptance criteria
- User can find and open a company.
- User can inspect the evidence behind a claim.
- User can compare city metrics without hiding definitions.
- User can inspect providers without unsupported ratings.
- User can extract a candidate claim with Gemini.
- User can save it as pending and review it.
- App remains comprehensible when tables are empty.
- Secrets remain server-side.
