/* Panchang engine. Works in the browser (window.PE) and in Node (module.exports).
   Tithi, nakshatra, yoga, karana and sankranti moments come from events.json (computed with
   astronomy-engine, Lahiri ayanamsa); sunrise and sunset are computed here for the chosen place. */
(function (root) {
  var PE = {}, MIN = 60000, DAY = 86400000;

  PE.TITHI = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"];
  PE.TITHI_HI = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावस्या"];
  PE.NAK = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
  PE.NAK_HI = ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती",
    "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती"];
  PE.YOGA = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
  PE.YOGA_HI = ["विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र",
    "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"];
  var KAR = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"], KAR_HI = ["बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)"];
  PE.karanaName = function (k, hi) {
    if (k === 0) return hi ? "किंस्तुघ्न" : "Kimstughna";
    if (k >= 57) return hi ? ["शकुनि", "चतुष्पाद", "नाग"][k - 57] : ["Shakuni", "Chatushpada", "Naga"][k - 57];
    return (hi ? KAR_HI : KAR)[(k - 1) % 7];
  };
  PE.RASHI = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
  PE.RASHI_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];
  PE.MONTH = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
  PE.MONTH_HI = ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"];
  PE.VAAR = ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar"];
  PE.VAAR_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

  /* ---------- events ---------- */
  var S = {};
  PE.load = function (json) {
    var ep = Date.parse(json.epoch), n = { tithi: 30, karana: 60, nakshatra: 27, yoga: 27, sunrashi: 12, moonrashi: 12 };
    Object.keys(n).forEach(function (k) {
      var t = ep, v = json[k].v0, times = [ep], vals = [v];
      json[k].d.forEach(function (d) { t += d * MIN; v = (v + 1) % n[k]; times.push(t); vals.push(v); });
      S[k] = { t: times, v: vals };
    });
    PE.first = ep; PE.last = S.tithi.t[S.tithi.t.length - 1];
  };
  function idx(s, t) { var lo = 0, hi = s.t.length - 1; while (lo < hi) { var m = (lo + hi + 1) >> 1; if (s.t[m] <= t) lo = m; else hi = m - 1; } return lo; }
  /** value at time t, when it started and when it ends */
  PE.at = function (name, t) { var s = S[name], i = idx(s, t); return { v: s.v[i], start: s.t[i], end: s.t[i + 1] || null }; };
  PE.inRange = function (t) { return S.tithi && t >= PE.first && t < PE.last; };

  /* ---------- sun: NOAA formulas, about a minute of accuracy ---------- */
  function rad(d) { return d * Math.PI / 180; } function deg(r) { return r * 180 / Math.PI; }
  function sunEvent(y, m, d, lat, lon, rise, alt) {
    // returns UTC ms of sunrise/sunset on the civil date y-m-d (UTC date of the local day)
    var t = Date.UTC(y, m - 1, d, 12) - lon / 360 * DAY, res = null;
    for (var it = 0; it < 3; it++) {
      var jc = ((t / DAY + 2440587.5) - 2451545) / 36525;
      var L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360, M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
      var e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
      var C = Math.sin(rad(M)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * jc) + Math.sin(rad(3 * M)) * 0.000289;
      var lam = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * jc));
      var eps0 = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60, eps = eps0 + 0.00256 * Math.cos(rad(125.04 - 1934.136 * jc));
      var decl = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lam))));
      var yv = Math.tan(rad(eps / 2)) * Math.tan(rad(eps / 2));
      var eqt = 4 * deg(yv * Math.sin(2 * rad(L0)) - 2 * e * Math.sin(rad(M)) + 4 * e * yv * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) - 0.5 * yv * yv * Math.sin(4 * rad(L0)) - 1.25 * e * e * Math.sin(2 * rad(M)));
      var cosH = (Math.sin(rad(alt)) - Math.sin(rad(lat)) * Math.sin(rad(decl))) / (Math.cos(rad(lat)) * Math.cos(rad(decl)));
      if (cosH < -1 || cosH > 1) return null;
      var H = deg(Math.acos(cosH)), noonMin = 720 - 4 * lon - eqt;
      res = Date.UTC(y, m - 1, d) + (noonMin + (rise ? -4 * H : 4 * H)) * MIN;
      t = res;
    }
    return res;
  }
  /** Sun times for a local calendar date at a place. tz is hours from UTC. */
  PE.sun = function (y, m, d, place) {
    // the local date's UTC calendar date is the same for India; for far-west places shift the noon guess
    var r = sunEvent(y, m, d, place.lat, place.lon, true, -0.833), s = sunEvent(y, m, d, place.lat, place.lon, false, -0.833);
    var nd = new Date(Date.UTC(y, m - 1, d) + DAY), r2 = sunEvent(nd.getUTCFullYear(), nd.getUTCMonth() + 1, nd.getUTCDate(), place.lat, place.lon, true, -0.833);
    return { rise: r, set: s, nextRise: r2 };
  };

  /* ---------- lunar month ---------- */
  // the new moon (end of Amavasya) at or before t
  function newMoonBefore(t) { var s = S.tithi, i = idx(s, t); while (i > 0 && s.v[i] !== 0) i--; return s.t[i]; }
  function newMoonAfter(t) { var s = S.tithi, i = idx(s, t) + 1; while (i < s.t.length && s.v[i] !== 0) i++; return s.t[i]; }
  /** Amanta month: named by the sidereal sign of the sun at the new moon that starts it; adhik when no sankranti falls inside. */
  PE.month = function (t) {
    var nm = newMoonBefore(t), nm2 = newMoonAfter(t);
    var r1 = PE.at("sunrashi", nm + MIN).v, r2 = PE.at("sunrashi", (nm2 || nm + 29.5 * DAY) + MIN).v;
    var adhik = r1 === r2;
    return { amanta: (r1 + 1) % 12, adhik: adhik, start: nm, end: nm2 };
  };
  /** Purnimanta name: the Krishna paksha belongs to the next month (adhik months keep their own name). */
  PE.purnimanta = function (m, tithiIdx) { return (!m.adhik && tithiIdx >= 15) ? (m.amanta + 1) % 12 : m.amanta; };

  /* ---------- muhurta ---------- */
  var RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULI = [7, 6, 5, 4, 3, 2, 1]; // 1-based eighth of the day, Sunday first
  PE.muhurta = function (rise, set, wd) {
    var part = (set - rise) / 8, mid = (rise + set) / 2, m15 = (set - rise) / 15;
    function seg(n) { return [rise + (n - 1) * part, rise + n * part]; }
    return { rahu: seg(RAHU[wd]), yama: seg(YAMA[wd]), gulika: seg(GULI[wd]), abhijit: wd === 3 ? null : [mid - m15 / 2, mid + m15 / 2] };
  };

  /* ---------- one day ---------- */
  /** Panchang for the local date y-m-d at place {lat, lon, tz}. Values are those prevailing at sunrise, with their end times. */
  PE.day = function (y, m, d, place) {
    var sun = PE.sun(y, m, d, place), t = sun.rise || Date.UTC(y, m - 1, d) - place.tz * 3600000 + 6 * 3600000;
    var wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    function list(name, until) { // every value that runs during the day, up to next sunrise
      var out = [], cur = PE.at(name, t);
      out.push(cur);
      while (cur.end && cur.end < until) { cur = PE.at(name, cur.end + 1); out.push(cur); }
      return out;
    }
    var until = sun.nextRise || t + DAY, ti = PE.at("tithi", t), mo = PE.month(t);
    var yr = new Date(t + place.tz * 3600000).getUTCFullYear();
    var chaitraStarted = mo.amanta < 10 && !(mo.amanta === 0 && false);
    // Vikram samvat changes at Chaitra Shukla Pratipada
    var vs = yr + (PE.isAfterChaitra(t) ? 57 : 56);
    return {
      sun: sun, weekday: wd, tithi: list("tithi", until), nakshatra: list("nakshatra", until), yoga: list("yoga", until), karana: list("karana", until),
      moonRashi: list("moonrashi", until), sunRashi: PE.at("sunrashi", t), month: mo, purnimanta: PE.purnimanta(mo, ti.v), paksha: ti.v < 15 ? "S" : "K",
      muhurta: sun.rise && sun.set ? PE.muhurta(sun.rise, sun.set, wd) : null, vikram: vs, shaka: vs - 135
    };
  };
  // Chaitra Shukla Pratipada (start of Chaitra, non-adhik) of the year containing t has passed
  PE.isAfterChaitra = function (t) {
    var yr = new Date(t).getUTCFullYear(), s = S.tithi, best = null;
    for (var i = idx(s, Date.UTC(yr, 1, 1)); i < s.t.length && s.t[i] < Date.UTC(yr, 4, 15); i++) {
      if (s.v[i] === 0) { var mo = PE.month(s.t[i] + MIN); if (mo.amanta === 0 && !mo.adhik) { best = s.t[i]; break; } }
    }
    return best !== null && t >= best;
  };

  /* ---------- festivals ---------- */
  // m: amanta month (0 Chaitra), t: tithi 1-30, k: time of day the tithi must cover, plus: days added after the chosen day
  PE.FEST = [
    { id: "ganesh-jayanti", en: "Ganesh Jayanti", hi: "गणेश जयंती", m: 10, t: 4, k: "madhyahna" },
    { id: "vasant-panchami", en: "Vasant Panchami", hi: "वसंत पंचमी", m: 10, t: 5, k: "purvahna" },
    { id: "maha-shivratri", en: "Maha Shivratri", hi: "महाशिवरात्रि", m: 10, t: 29, k: "nishita" },
    { id: "holika-dahan", en: "Holika Dahan", hi: "होलिका दहन", m: 11, t: 15, k: "pradosh" },
    { id: "holi", en: "Holi", hi: "होली", m: 11, t: 15, k: "pradosh", plus: 1 },
    { id: "chaitra-navratri", en: "Chaitra Navratri begins, Gudi Padwa, Ugadi", hi: "चैत्र नवरात्रि आरंभ, गुड़ी पड़वा, उगादि", m: 0, t: 1, k: "sunrise" },
    { id: "ram-navami", en: "Ram Navami", hi: "राम नवमी", m: 0, t: 9, k: "madhyahna" },
    { id: "hanuman-jayanti", en: "Hanuman Jayanti", hi: "हनुमान जयंती", m: 0, t: 15, k: "sunrise" },
    { id: "akshaya-tritiya", en: "Akshaya Tritiya", hi: "अक्षय तृतीया", m: 1, t: 3, k: "purvahna" },
    { id: "buddha-purnima", en: "Buddha Purnima", hi: "बुद्ध पूर्णिमा", m: 1, t: 15, k: "sunrise" },
    { id: "guru-purnima", en: "Guru Purnima", hi: "गुरु पूर्णिमा", m: 3, t: 15, k: "sunrise" },
    { id: "hariyali-teej", en: "Hariyali Teej", hi: "हरियाली तीज", m: 4, t: 3, k: "sunrise" },
    { id: "nag-panchami", en: "Nag Panchami", hi: "नाग पंचमी", m: 4, t: 5, k: "purvahna" },
    { id: "raksha-bandhan", en: "Raksha Bandhan", hi: "रक्षा बंधन", m: 4, t: 15, k: "aparahna", noBhadra: true },
    { id: "janmashtami", en: "Krishna Janmashtami", hi: "कृष्ण जन्माष्टमी", m: 4, t: 23, k: "nishita" },
    { id: "hartalika-teej", en: "Hartalika Teej", hi: "हरतालिका तीज", m: 5, t: 3, k: "sunrise" },
    { id: "ganesh-chaturthi", en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी", m: 5, t: 4, k: "madhyahna" },
    { id: "anant-chaturdashi", en: "Anant Chaturdashi", hi: "अनंत चतुर्दशी", m: 5, t: 14, k: "sunrise" },
    { id: "sharad-navratri", en: "Sharad Navratri begins", hi: "शारदीय नवरात्रि आरंभ", m: 6, t: 1, k: "sunrise" },
    { id: "dussehra", en: "Dussehra (Vijayadashami)", hi: "दशहरा (विजयादशमी)", m: 6, t: 10, k: "aparahna" },
    { id: "sharad-purnima", en: "Sharad Purnima", hi: "शरद पूर्णिमा", m: 6, t: 15, k: "nishita" },
    { id: "karwa-chauth", en: "Karwa Chauth", hi: "करवा चौथ", m: 6, t: 19, k: "moonrise" },
    { id: "dhanteras", en: "Dhanteras", hi: "धनतेरस", m: 6, t: 28, k: "pradosh" },
    { id: "diwali", en: "Diwali (Lakshmi Puja)", hi: "दीपावली (लक्ष्मी पूजा)", m: 6, t: 30, k: "pradosh" },
    { id: "govardhan", en: "Govardhan Puja", hi: "गोवर्धन पूजा", m: 7, t: 1, k: "sunrise" },
    { id: "bhai-dooj", en: "Bhai Dooj", hi: "भाई दूज", m: 7, t: 2, k: "sunrise" },
    { id: "chhath", en: "Chhath Puja (evening arghya)", hi: "छठ पूजा (संध्या अर्घ्य)", m: 7, t: 6, k: "sunrise" },
    { id: "dev-uthani", en: "Dev Uthani Ekadashi", hi: "देवउठनी एकादशी", m: 7, t: 11, k: "sunrise" },
    { id: "kartik-purnima", en: "Kartik Purnima", hi: "कार्तिक पूर्णिमा", m: 7, t: 15, k: "sunrise" }
  ];

  // published shifts the rules cannot see, such as a lunar eclipse on the festival day
  PE.OVERRIDE = { "holi:2026": [2026, 3, 4] };

  /** the moment in a local day that a rule looks at */
  function kaalTime(k, sun) {
    var r = sun.rise, s = sun.set, len = s - r;
    switch (k) {
      case "purvahna": return r + len * 0.3;
      case "madhyahna": return r + len * 0.5;
      case "aparahna": return r + len * 0.7;
      case "pradosh": return s + 72 * MIN;
      case "moonrise": return s + 150 * MIN;
      case "nishita": return (s + sun.nextRise) / 2;
      default: return r + MIN;
    }
  }
  function localDate(t, tz) { var d = new Date(t + tz * 3600000); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; }

  /** Every festival day between two local dates (inclusive) at a place. */
  PE.festivals = function (from, to, place) {
    var out = [], seen = {}, months = {}, t0 = Date.UTC(from[0], from[1] - 1, from[2]), t1 = Date.UTC(to[0], to[1] - 1, to[2]);
    function add(f, y, mo, d) {
      var day = new Date(Date.UTC(y, mo - 1, d) + (f.plus || 0) * DAY), date = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()];
      date = PE.OVERRIDE[f.id + ":" + date[0]] || date;
      out.push({ id: f.id, en: f.en, hi: f.hi, date: date });
    }
    for (var t = t0; t <= t1; t += DAY) {
      var dt = new Date(t), y = dt.getUTCFullYear(), mo = dt.getUTCMonth() + 1, d = dt.getUTCDate(), sun = PE.sun(y, mo, d, place);
      if (!sun.rise || !PE.inRange(sun.rise) || !PE.inRange(sun.nextRise)) continue;
      PE.FEST.forEach(function (f) {
        var k = kaalTime(f.k, sun), ti = PE.at("tithi", k), m = PE.month(k);
        if (m.amanta === f.m && !m.adhik) months[f.id + ":" + m.start] = { f: f, m: m };
        if (ti.v + 1 !== f.t || m.amanta !== f.m || m.adhik) return;
        var key = f.id + ":" + m.start;
        if (seen[key]) return; // tithi covers the time on two days: the first day wins
        if (f.noBhadra && PE.karanaName(PE.at("karana", k).v) === "Vishti") {
          // Bhadra (Vishti karana) spoils the time; move to the next day if the tithi is still current at its sunrise
          if (ti.end && ti.end > sun.nextRise) { seen[key] = true; var nx = new Date(t + DAY); add(f, nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate()); }
          return;
        }
        seen[key] = true;
        add(f, y, mo, d);
      });
    }
    // a tithi that never covers its time of day (kshaya) falls on the day it begins
    Object.keys(months).forEach(function (key) {
      if (seen[key]) return;
      var f = months[key].f, m = months[key].m, s = S.tithi;
      for (var i = idx(s, m.start); i < s.t.length && s.t[i] < (m.end || m.start + 30 * DAY); i++) {
        if (s.v[i] === f.t - 1) {
          var ld = localDate(s.t[i], place.tz), lt = Date.UTC(ld[0], ld[1] - 1, ld[2]);
          if (lt >= t0 && lt <= t1) add(f, ld[0], ld[1], ld[2]);
          break;
        }
      }
    });
    return out.sort(function (a, b) { return Date.UTC(a.date[0], a.date[1] - 1, a.date[2]) - Date.UTC(b.date[0], b.date[1] - 1, b.date[2]); });
  };

  /** Sankrantis between two instants. */
  PE.sankrantis = function (t1, t2) {
    var s = S.sunrashi, out = [];
    for (var i = idx(s, t1) + 1; i < s.t.length && s.t[i] <= t2; i++) out.push({ t: s.t[i], rashi: s.v[i] });
    return out;
  };

  /** Monthly vrat days: Ekadashi, Pradosh, Sankashti, Masik Shivratri, Purnima, Amavasya. */
  PE.VRAT = [
    { id: "ekadashi", en: "Ekadashi", hi: "एकादशी", t: [11, 26], k: "sunrise" },
    { id: "pradosh", en: "Pradosh Vrat", hi: "प्रदोष व्रत", t: [13, 28], k: "pradosh" },
    { id: "sankashti", en: "Sankashti Chaturthi", hi: "संकष्टी चतुर्थी", t: [19], k: "moonrise" },
    { id: "shivratri", en: "Masik Shivratri", hi: "मासिक शिवरात्रि", t: [29], k: "nishita" },
    { id: "purnima", en: "Purnima", hi: "पूर्णिमा", t: [15], k: "sunrise" },
    { id: "amavasya", en: "Amavasya", hi: "अमावस्या", t: [30], k: "sunrise" }
  ];
  PE.vrats = function (from, to, place) {
    var out = [], seen = {};
    for (var t = Date.UTC(from[0], from[1] - 1, from[2]); t <= Date.UTC(to[0], to[1] - 1, to[2]); t += DAY) {
      var dt = new Date(t), y = dt.getUTCFullYear(), mo = dt.getUTCMonth() + 1, d = dt.getUTCDate(), sun = PE.sun(y, mo, d, place);
      if (!sun.rise || !PE.inRange(sun.rise) || !PE.inRange(sun.nextRise)) continue;
      PE.VRAT.forEach(function (f) {
        var ti = PE.at("tithi", kaalTime(f.k, sun));
        if (f.t.indexOf(ti.v + 1) < 0 || seen[f.id + ti.start]) return;
        seen[f.id + ti.start] = true;
        out.push({ id: f.id, en: f.en, hi: f.hi, date: [y, mo, d], paksha: ti.v < 15 ? "S" : "K" });
      });
    }
    return out;
  };
  PE.localDate = localDate;

  if (typeof module !== "undefined" && module.exports) module.exports = PE; else root.PE = PE;
})(this);
