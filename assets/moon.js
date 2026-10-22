/* Moon position (Meeus, Astronomical Algorithms ch. 47, main terms), moonrise/moonset, Choghadiya, Hora and
   simple muhurat checks. Adds to PE from engine.js. Works in the browser and in Node. */
(function (root) {
  var PE = root.PE || (typeof require !== "undefined" ? require("./engine.js") : null);
  var DEG = Math.PI / 180, MIN = 60000, DAY = 86400000;
  function s(x) { return Math.sin(x * DEG); } function c(x) { return Math.cos(x * DEG); }
  function norm(a) { a %= 360; return a < 0 ? a + 360 : a; }

  // [D, M, M', F, longitude 1e-6 deg, distance 1e-3 km]
  var LR = [[0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],[0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],
    [0,0,0,2,-114332,-3149],[2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],[2,-1,0,0,45758,-204586],[0,1,-1,0,-40923,-129620],
    [1,0,0,0,-34720,108743],[0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],[0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],
    [0,0,3,0,10034,-23210],[4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],[2,1,0,0,-6766,30824],[1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],
    [2,-1,1,0,4036,-12831],[2,0,2,0,3994,-10445],[4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],[0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],
    [2,-1,-2,0,2390,10056],[1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],[0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],
    [2,0,1,-2,-1773,4130],[2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],[3,0,-1,0,-892,3258],[2,1,1,0,-810,2616],
    [4,-1,-2,0,759,-1897],[0,2,-1,0,-713,-2117],[2,2,-1,0,-700,2354],[2,1,-2,0,691,0],[2,-1,0,-2,596,0],[4,0,1,0,549,-1423],
    [0,0,4,0,537,-1117],[4,-1,0,0,520,-1571],[1,0,-2,0,-487,-1739],[2,1,0,-2,-399,0],[0,0,2,-2,-381,-4421],[1,1,1,0,351,0],
    [3,0,-2,0,-340,0],[4,0,-3,0,330,0],[2,-1,2,0,327,0],[0,2,1,0,-323,1165],[1,1,-1,0,299,0],[2,0,3,0,294,0],[2,0,-1,-2,0,8752]];
  // [D, M, M', F, latitude 1e-6 deg]
  var B = [[0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],
    [0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],
    [2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],[0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],
    [0,1,1,1,-1475],[0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],[4,0,0,-1,1021],[4,0,-1,1,833]];

  /** Geocentric ecliptic longitude/latitude (deg, of date) and distance (km) of the Moon at UTC ms. */
  PE.moonPos = function (ms) {
    var jd = ms / DAY + 2440587.5 + 69 / 86400, T = (jd - 2451545) / 36525;   // TT is about UT + 69 s
    var Lp = norm(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T), D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
    var M = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T), Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
    var F = norm(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T), E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var A1 = norm(119.75 + 131.849 * T), A2 = norm(53.09 + 479264.290 * T), A3 = norm(313.45 + 481266.484 * T);
    var sl = 0, sr = 0, sb = 0;
    LR.forEach(function (t) { var e = Math.abs(t[1]) === 1 ? E : Math.abs(t[1]) === 2 ? E * E : 1, a = t[0] * D + t[1] * M + t[2] * Mp + t[3] * F; sl += t[4] * e * s(a); sr += t[5] * e * c(a); });
    B.forEach(function (t) { var e = Math.abs(t[1]) === 1 ? E : Math.abs(t[1]) === 2 ? E * E : 1; sb += t[4] * e * s(t[0] * D + t[1] * M + t[2] * Mp + t[3] * F); });
    sl += 3958 * s(A1) + 1962 * s(Lp - F) + 318 * s(A2);
    sb += -2235 * s(Lp) + 382 * s(A3) + 175 * s(A1 - F) + 175 * s(A1 + F) + 127 * s(Lp - Mp) - 115 * s(Lp + Mp);
    var om = norm(125.04452 - 1934.136261 * T), dpsi = (-17.2 * s(om) - 1.32 * s(2 * norm(280.4665 + 36000.7698 * T)) - 0.23 * s(2 * Lp) + 0.21 * s(2 * om)) / 3600;
    return { lon: norm(Lp + sl / 1e6 + dpsi), lat: sb / 1e6, dist: 385000.56 + sr / 1000, T: T };
  };

  /** Moon altitude (deg) seen from lat/lon at UTC ms, with parallax applied. */
  function moonAlt(ms, lat, lon) {
    var p = PE.moonPos(ms), T = p.T, eps = 23.4392911 - 0.0130042 * T;
    var ra = Math.atan2(s(p.lon) * c(eps) - Math.tan(p.lat * DEG) * s(eps), c(p.lon)) / DEG, dec = Math.asin(s(p.lat) * c(eps) + c(p.lat) * s(eps) * s(p.lon)) / DEG;
    var jd = ms / DAY + 2440587.5, gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545)), H = gmst + lon - ra;
    var alt = Math.asin(s(lat) * s(dec) + c(lat) * c(dec) * c(H)) / DEG;
    var par = Math.asin(6378.14 / p.dist) / DEG;
    return alt - par * c(alt);  // topocentric
  }
  PE.moonAlt = moonAlt;

  /** Moonrise and moonset during the local day y-m-d at place (null when there is none that day). */
  PE.moonRiseSet = function (y, m, d, place) {
    // the upper limb touches the horizon: centre at -(34' refraction + 15.5' semidiameter)
    var start = Date.UTC(y, m - 1, d) - place.tz * 3600000, end = start + DAY, target = -0.8333;
    var rise = null, set = null, step = 10 * MIN, prev = moonAlt(start, place.lat, place.lon) - target;
    for (var t = start + step; t <= end + step && (rise === null || set === null); t += step) {
      var cur = moonAlt(t, place.lat, place.lon) - target;
      if ((prev < 0) !== (cur < 0)) {
        var lo = t - step, hi = t, up = prev < 0;
        for (var i = 0; i < 20; i++) { var mid = (lo + hi) / 2, v = moonAlt(mid, place.lat, place.lon) - target; if ((v < 0) === up) lo = mid; else hi = mid; }
        var hit = Math.round((lo + hi) / 2);
        if (hit >= start && hit < end) { if (up && rise === null) rise = hit; if (!up && set === null) set = hit; }
      }
      prev = cur;
    }
    return { rise: rise, set: set };
  };

  /* ---------- Choghadiya and Hora ---------- */
  var CH_DAY = ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"], CH_NIGHT = ["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg"];
  var CH_HI = { Udveg: "उद्वेग", Chal: "चर", Labh: "लाभ", Amrit: "अमृत", Kaal: "काल", Shubh: "शुभ", Rog: "रोग" };
  var CH_START_DAY = [0, 3, 6, 2, 5, 1, 4], CH_START_NIGHT = [0, 2, 4, 6, 1, 3, 5]; // index into the cycles, Sunday first
  PE.CH_GOOD = { Amrit: "best", Shubh: "good", Labh: "good", Chal: "neutral", Udveg: "bad", Kaal: "bad", Rog: "bad" };
  PE.choghadiya = function (sun, wd) {
    var out = [], dl = (sun.set - sun.rise) / 8, nl = (sun.nextRise - sun.set) / 8;
    for (var i = 0; i < 8; i++) { var n = CH_DAY[(CH_START_DAY[wd] + i) % 7]; out.push({ name: n, hi: CH_HI[n], start: sun.rise + i * dl, end: sun.rise + (i + 1) * dl, night: false }); }
    for (var j = 0; j < 8; j++) { var m = CH_NIGHT[(CH_START_NIGHT[wd] + j) % 7]; out.push({ name: m, hi: CH_HI[m], start: sun.set + j * nl, end: sun.set + (j + 1) * nl, night: true }); }
    return out;
  };
  var HORA = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"], HORA_HI = ["सूर्य", "शुक्र", "बुध", "चंद्र", "शनि", "गुरु", "मंगल"];
  var WD_LORD = [0, 3, 6, 2, 5, 1, 4]; // Sunday Sun, Monday Moon, Tuesday Mars, Wednesday Mercury, Thursday Jupiter, Friday Venus, Saturday Saturn
  PE.hora = function (sun, wd) {
    var out = [], dl = (sun.set - sun.rise) / 12, nl = (sun.nextRise - sun.set) / 12;
    for (var i = 0; i < 24; i++) {
      var k = (WD_LORD[wd] + i) % 7, st = i < 12 ? sun.rise + i * dl : sun.set + (i - 12) * nl;
      out.push({ name: HORA[k], hi: HORA_HI[k], start: st, end: st + (i < 12 ? dl : nl), night: i >= 12 });
    }
    return out;
  };

  /* ---------- simple muhurat days ---------- */
  // traditional nakshatra, tithi and weekday lists; planets' combustion and personal charts are not considered
  PE.MUHURAT = {
    vivah: { en: "Marriage", hi: "विवाह", nak: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26], night: true, noChaturmas: true },
    griha: { en: "Griha pravesh", hi: "गृह प्रवेश", nak: [3, 4, 11, 13, 16, 20, 25, 26], wdNot: [0, 2], months: [1, 2, 10, 11] },
    vehicle: { en: "Vehicle purchase", hi: "वाहन ख़रीद", nak: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26], wdNot: [2, 6] },
    property: { en: "Property purchase", hi: "संपत्ति ख़रीद", nak: [3, 4, 9, 10, 11, 15, 17, 18, 19, 21, 25, 26], wdNot: [2] },
    namkaran: { en: "Naming ceremony", hi: "नामकरण", nak: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26], wdNot: [2, 6] }
  };
  /** Days that pass the basic checks for a kind of muhurat. Marriage looks at the whole day and night, the rest at daytime. */
  PE.muhuratDays = function (kind, from, to, place) {
    var rule = PE.MUHURAT[kind], out = [];
    for (var t = Date.UTC(from[0], from[1] - 1, from[2]); t <= Date.UTC(to[0], to[1] - 1, to[2]); t += DAY) {
      var dt = new Date(t), y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate(), sun = PE.sun(y, m, d, place);
      if (!sun.rise || !PE.inRange(sun.rise) || !PE.inRange(sun.nextRise)) continue;
      var wd = dt.getUTCDay(), mo = PE.month(sun.rise), sr = PE.at("sunrashi", sun.rise).v;
      if (mo.adhik || sr === 8 || sr === 11) continue;          // no muhurat in Adhik maas or Kharmas (sun in Dhanu or Meena)
      if (rule.noChaturmas && PE.inChaturmas(sun.rise)) continue;
      if (rule.wdNot && rule.wdNot.indexOf(wd) >= 0) continue;
      if (rule.months && rule.months.indexOf(PE.purnimanta(mo, PE.at("tithi", sun.rise).v)) < 0) continue;
      // a good nakshatra and a usable tithi (not Rikta 4/9/14, not Amavasya) at the same time, checked every half hour
      var until = rule.night ? sun.nextRise : sun.set, hit = null;
      for (var k = sun.rise; k < until && !hit; k += 30 * MIN) {
        var n = PE.at("nakshatra", k), ti = PE.at("tithi", k), tn = ti.v + 1 > 15 ? ti.v - 14 : ti.v + 1;
        if (rule.nak.indexOf(n.v) >= 0 && ti.v !== 29 && [4, 9, 14].indexOf(tn) < 0) hit = { tithi: ti.v, nak: n.v, at: k };
      }
      if (hit) out.push({ date: [y, m, d], tithi: hit.tithi, nak: hit.nak, at: hit.at, wd: wd });
    }
    return out;
  };
  // Chaturmas: from Devshayani Ekadashi (Ashadha Shukla 11) to Dev Uthani Ekadashi (Kartika Shukla 11)
  PE.inChaturmas = function (t) {
    var mo = PE.month(t), ti = PE.at("tithi", t).v;
    if (mo.adhik) return true;
    var am = mo.amanta;
    if (am === 3) return ti >= 10;            // Ashadha from Shukla Ekadashi
    if (am >= 4 && am <= 6) return true;      // Shravana, Bhadrapada, Ashwin
    if (am === 7) return ti < 10;             // Kartika until Shukla Ekadashi
    return false;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = PE;
})(typeof window !== "undefined" ? window : this);
