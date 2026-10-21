// Checks the engine against published 2026 New Delhi dates.
const PE = require("../assets/engine.js");
PE.load(require("../assets/events.json"));
const DEL = { lat: 28.6139, lon: 77.209, tz: 5.5 };
const ist = t => new Date(t + 5.5 * 3600000).toISOString().slice(11, 16);
const want = { "vasant-panchami": "2026-01-23", "maha-shivratri": "2026-02-15", "holika-dahan": "2026-03-02", "holi": "2026-03-04",
  "chaitra-navratri": "2026-03-19", "ram-navami": "2026-03-26", "raksha-bandhan": "2026-08-28", "janmashtami": "2026-09-04",
  "ganesh-chaturthi": "2026-09-14", "sharad-navratri": "2026-10-11", "dussehra": "2026-10-20", "karwa-chauth": "2026-10-29",
  "dhanteras": "2026-11-06", "diwali": "2026-11-08", "bhai-dooj": "2026-11-11", "ganesh-jayanti": "2026-01-22" };
const got = PE.festivals([2026, 1, 1], [2026, 12, 31], DEL);
let ok = 0, bad = 0;
for (const f of got) {
  const ds = f.date.map((x, i) => i ? String(x).padStart(2, "0") : x).join("-");
  const w = want[f.id];
  if (w) { if (w === ds) ok++; else bad++; }
  console.log((w ? (w === ds ? "OK  " : "BAD ") : "    ") + ds + "  " + f.en + (w && w !== ds ? "   (published " + w + ")" : ""));
}
console.log("matched", ok, "wrong", bad, "missing", Object.keys(want).filter(k => !got.find(g => g.id === k)));
const d = PE.day(2026, 10, 20, DEL);
console.log("sunrise", ist(d.sun.rise), "sunset", ist(d.sun.set), "rahu", ist(d.muhurta.rahu[0]), ist(d.muhurta.rahu[1]));
console.log("tithi", d.tithi.map(x => PE.TITHI[x.v] + " to " + (x.end ? ist(x.end) : "")).join(", "));
console.log("yoga", d.yoga.map(x => PE.YOGA[x.v] + " to " + (x.end ? ist(x.end) : "")).join(", "));
console.log("month", PE.MONTH[d.month.amanta], d.month.adhik, "purnimanta", PE.MONTH[d.purnimanta], "VS", d.vikram);
for (const day of [[2026, 5, 20], [2026, 6, 20]]) { const x = PE.day(...day, DEL); console.log(day.join("-"), PE.MONTH[x.month.amanta], x.month.adhik ? "ADHIK" : ""); }
