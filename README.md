# Osso

Draft marketing + commerce site for **Osso**, an in-shower water softener for renters and anyone who can't fit (or doesn't want) a whole-home system.

Static HTML/CSS/JS, no build step. Open `index.html` or run `python3 -m http.server` in this folder.

## What's here
- `index.html` – hero, specs, hard-water explainer, install steps, ion-exchange science, Recharge Pod, cadence calculator, shop, renter pitch, comparison table, FAQ.
- `styles.css` – design tokens at the top (light + dark themes).
- `app.js` – cart drawer (localStorage), one-time vs. subscribe-and-save pods, cadence calculator.
- `assets/` – hero and pod imagery.

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
