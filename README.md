# Osso

Draft marketing + commerce site for **Osso**, an in-shower water softener for renters and anyone who can't fit (or doesn't want) a whole-home system.

Static HTML/CSS/JS, no build step. Open `index.html` or run `python3 -m http.server` in this folder.

## What's here
- `index.html` – hero, specs, hard-water explainer, install steps, ion-exchange science, Recharge Pod, cadence calculator, shop, renter pitch, comparison table, FAQ.
- `styles.css` – design tokens at the top (light + dark themes).
- `app.js` – cart drawer (localStorage), one-time vs. subscribe-and-save pods, cadence calculator.
- `assets/` – hero and pod imagery.

## Waitlist / user-testing page
`landing.html` is a standalone page for interest testing:
- Waitlist signup (email + rent/own), plus a "Reserve for $129" fake-door button to measure purchase intent. Nothing is charged.
- 5-question survey after signup: how much hard water bothers them, what they've tried and spend, showers and ZIP, price sensitivity for the kit and pods, open feedback and interview opt-in. Partial answers are saved so you can see drop-off.
- Headline A/B test: link to `landing.html#b` for variant B. Each response records its variant.
- Where answers go: on claude.ai it uses the artifact's database, with an owner-only results panel. When hosted elsewhere, set `ENDPOINT` in the script to a form backend (Formspree, Google Apps Script → Sheets, etc.); without it, answers stay in the visitor's browser.

## Cadence calculator model (draft)
- Gallons/week = showers × minutes × flow (gpm by building era: <1960 1.9, 1960–93 2.3, 1994–2015 2.2, 2016+ 1.8, unknown 2.1).
- Hardness (gpg) from a coarse 3-digit-ZIP regional table; falls back to a 10 gpg U.S. average.
- Grains/week = gallons × gpg × pipe-wear factor (1.15 pre-1960, 1.08 1960–93).
- Pod capacity: 6,400 grains (placeholder until lab-rated).
- Plan = pack size {1,2,3,4,6} × cadence {2,4,6,8 weeks} with the least overshoot.

## Not wired up yet
- Checkout: hand off to Shopify with selling plans (Shopify Subscriptions or Recharge).
- Hardness: replace the ZIP table with utility-level data (EPA SDWIS / Consumer Confidence Reports).
- Performance claims, pricing and pod capacity are placeholders pending testing.
