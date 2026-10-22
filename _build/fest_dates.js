// Prints festival dates 2025-2030 and one year of vrat dates for New Delhi, for the static festival pages.
const PE = require("../assets/moon.js");
PE.load(require("../assets/events.json"));
const DEL = { lat: 28.6139, lon: 77.209, tz: 5.5 }, year = +process.argv[2];
const out = {};
for (const f of PE.FEST) out[f.id] = PE.festivals([2025, 1, 1], [2030, 12, 31], DEL, f.id).map(h => h.date);
for (const v of PE.vrats([year, 1, 1], [year, 12, 31], DEL)) {
  const mo = PE.month(PE.sun(v.date[0], v.date[1], v.date[2], DEL).rise), sh = v.paksha === "S";
  const name = v.id === "ekadashi" ? [PE.ekadashiName(mo, sh, false), PE.ekadashiName(mo, sh, true)]
    : v.id === "purnima" || v.id === "amavasya" ? [PE.MONTH[PE.purnimanta(mo, sh ? 0 : 20)], PE.MONTH_HI[PE.purnimanta(mo, sh ? 0 : 20)]]
    : sh ? ["Shukla", "शुक्ल"] : ["Krishna", "कृष्ण"];
  if (mo.adhik) { name[0] += " (Adhik)"; name[1] += " (अधिक)"; }
  (out[v.id] = out[v.id] || []).push([v.date, name]);
}
process.stdout.write(JSON.stringify(out));
