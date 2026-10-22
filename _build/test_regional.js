// Checks the regional calendars against published 2026 dates (same checks as the app's test/regional_test.dart).
global.PE = require("../assets/engine.js");
PE.load(require("../assets/events.json"));
const PR = require("../assets/regional.js");
const P = { chennai: { lat: 13.0827, lon: 80.2707, tz: 5.5 }, kolkata: { lat: 22.5726, lon: 88.3639, tz: 5.5 }, tvm: { lat: 8.5241, lon: 76.9366, tz: 5.5 }, ahd: { lat: 23.0225, lon: 72.5714, tz: 5.5 }, pune: { lat: 18.5204, lon: 73.8567, tz: 5.5 } };
const want = [
  ["tamil", "chennai", [2026, 4, 14], "Chithirai 1, Parabhava year, Thiruvalluvar 2057"],
  ["tamil", "chennai", [2026, 1, 14], "Thai 1, Vishvavasu year, Thiruvalluvar 2057"],
  ["bengali", "kolkata", [2026, 4, 15], "1 Boishakh 1433 Bangabda"],
  ["malayalam", "tvm", [2026, 4, 14], "Medam 1, Kollam Era 1201"],
  ["malayalam", "tvm", [2026, 8, 17], "Chingam 1, Kollam Era 1202"],
  ["gujarati", "ahd", [2026, 11, 10], "Kartak Sud 1, Vikram Samvat 2083"],
  ["marathi", "pune", [2026, 3, 19], "Chaitra Shuddha 1, Shaka 1948"],
];
let bad = 0;
for (const [cal, city, d, w] of want) {
  const r = PR.day(cal, d[0], d[1], d[2], P[city]), got = r ? PR.label(r, false) : "null";
  if (got !== w) bad++;
  console.log((got === w ? "OK  " : "BAD ") + cal + " " + d.join("-") + "  " + got + (got === w ? "" : "   (want " + w + ")"));
}
console.log(bad ? bad + " wrong" : "all match");
process.exitCode = bad ? 1 : 0;
