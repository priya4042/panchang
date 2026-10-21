# Panchang

Free daily Hindu panchang for any Indian city: tithi, nakshatra, yoga, karana, vaar with end times, sunrise and sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit, moon and sun sign, Amanta and Purnimanta month (with Adhik), Vikram and Shaka samvat, a month calendar and every festival and vrat for 2025 to 2030. English and Hindi, dark mode, works offline.

## How it works
- `_build/gen_events.py` (Python, `pip install astronomy-engine`) finds every tithi, karana, nakshatra, yoga, sun-sign and moon-sign change from 2025-01-01 to 2031-01-01 and writes `assets/events.json` (57 KB). Lahiri ayanamsa, offset +35" so 2026 sankranti moments match Drik Panchang to the minute.
- `assets/engine.js` reads that file, works out sunrise/sunset (NOAA formulas) for the place, the day's values at sunrise, lunar months and festival days. It also runs in Node.
- Festivals are rules (amanta month, tithi, and the time of day the tithi must cover: sunrise, purvahna, madhyahna, aparahna, pradosh, moonrise, nishita), with a Bhadra rule for Raksha Bandhan and a fallback for kshaya tithis. `PE.OVERRIDE` holds published one-off shifts (Holi 2026, moved for the lunar eclipse).

## Checks
`node _build/test_engine.js` compares 16 festivals with published 2026 New Delhi dates (all match); 2027 dates were also checked.

## Editing
```
python _build/gen_events.py   # only to extend the years (change END in the script)
python _build/build.py        # pages, sitemap, manifest, sw.js
python _build/icons.py        # icons + og.png
```
Bump `CACHE` in build.py's sw.js text when shipping changes.
