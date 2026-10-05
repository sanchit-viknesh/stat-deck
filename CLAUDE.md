# StatDeck: working rules

A fan-made, non-commercial, two-player stat-comparison card game (Angular). The owner is building it as a portfolio piece and to share with friends. It must never create legal trouble.

## IP and licensing review (mandatory on every change)

Every code change AND every design change gets a licensing/IP check before it is reported as done. End each task summary with a one-line `IP check:` result (what was checked, anything flagged). If something is flagged, fix it or ask the owner before continuing.

Check each change against this list:

1. **Photos and likeness.** No real player photos, signatures or lookalike illustrations. Use the themed silhouette. `photoUrl` stays unused until a licensed source is chosen (then add a credit and licence field per image).
2. **Marks and branding.** No team crests, league/board logos (BCCI, ICC, MCC, Real Madrid and similar), club kits, stadium or sponsor logos, or look-alike flags and emblems. Country names and plain national flags are fine.
3. **Trademarked names.** Do not use "Top Trumps" or other brand names in the product name, UI, README, or comments. Say "stat-comparison card game". Stadium art stays unlabelled and stylised.
4. **Artwork.** Everything is drawn by us. Never copy or trace artwork from existing cards, games, or stadium photos. The 90s look is a style only.
5. **Data.** Stats are facts, but never scrape or copy from sites whose terms forbid it (Cricinfo, ESPN and similar). The bundled deck is approximate sample data and must stay labelled as illustrative. A new data source needs its terms checked first and recorded in the README.
6. **Dependencies, fonts and assets.** Only permissive licences (MIT, Apache-2.0, BSD, ISC, SIL OFL for fonts, CC0). Check the licence before adding any package, font or image; flag GPL/AGPL, "non-commercial" and unlicensed items.
7. **Disclaimer.** The README and app footer must keep: "Unofficial fan project. Not affiliated with or endorsed by any player, team, league or stadium."
8. **Public demo.** Screenshots, the live demo and LinkedIn posts use the fictional deck, not real names. The real-name deck is for friends only.

## Stop and ask first if a change would

- add ads, payments, a paid tier, or anything that earns money,
- use a real photo, official logo, or official team or league branding,
- pull in a new data source or paid API,
- use real player names outside the non-commercial friends setup.

## Conventions

- Develop on `feature/statdeck-cricket-model`; open a PR only when asked.
- Game logic stays in plain TypeScript under `src/app/core/game` with unit tests, no Angular inside.
