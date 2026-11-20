/* Regional calendars, the same rules as the app's lib/regional.dart. Uses PE (engine.js).
   Solar months start from the sidereal sankranti: Tamil, that day if before sunset, else the next day;
   Bengali (West Bengal), the next day if between sunrise and midnight, the day after next if after midnight;
   Malayalam, that day if within the first 3/5 of daytime, else the next day (Sewell and Dikshit, The Indian Calendar, art. 28; drikpanchang.com; midnight is civil 00:00).
   Gujarati: amanta months, Vikram Samvat from Kartika Shukla Pratipada. Marathi: amanta months, Shaka from Gudi Padwa. */
(function (root) {
  var DAY = 86400000, MIN = 60000, PR = {};
  PR.IDS = ["none", "tamil", "bengali", "malayalam", "gujarati", "marathi"];
  PR.EN = { none: "None", tamil: "Tamil", bengali: "Bengali", malayalam: "Malayalam", gujarati: "Gujarati", marathi: "Marathi" };
  PR.HI = { none: "कोई नहीं", tamil: "तमिल", bengali: "बांग्ला", malayalam: "मलयालम", gujarati: "गुजराती", marathi: "मराठी" };
  var M = {
    tamil: [["Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Purattasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"],
      ["चित्तिरै", "वैकासि", "आनि", "आडि", "आवणि", "पुरट्टासि", "ऐप्पसि", "कार्तिगै", "मार्गळि", "तै", "मासि", "पंगुनि"]],
    bengali: [["Boishakh", "Joishtho", "Asharh", "Srabon", "Bhadro", "Ashwin", "Kartik", "Ogrohayon", "Poush", "Magh", "Falgun", "Choitro"],
      ["बैशाख", "ज्यैष्ठ", "आषाढ़", "श्रावण", "भाद्र", "आश्विन", "कार्तिक", "अग्रहायण", "पौष", "माघ", "फाल्गुन", "चैत्र"]],
    malayalam: [["Chingam", "Kanni", "Thulam", "Vrischikam", "Dhanu", "Makaram", "Kumbham", "Meenam", "Medam", "Edavam", "Mithunam", "Karkidakam"],
      ["चिंगम", "कन्नि", "तुलाम", "वृश्चिकम", "धनु", "मकरम", "कुंभम", "मीनम", "मेडम", "इडवम", "मिथुनम", "कर्कडकम"]],
    gujarati: [["Kartak", "Magshar", "Posh", "Maha", "Fagan", "Chaitra", "Vaishakh", "Jeth", "Ashadh", "Shravan", "Bhadarvo", "Aso"],
      ["कारतक", "मागशर", "पोष", "महा", "फागण", "चैत्र", "वैशाख", "जेठ", "अषाढ़", "श्रावण", "भादरवो", "आसो"]],
    marathi: [["Chaitra", "Vaishakh", "Jyeshtha", "Ashadh", "Shravan", "Bhadrapad", "Ashwin", "Kartik", "Margashirsha", "Paush", "Magh", "Phalgun"],
      ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"]]
  };
  // the 60-year cycle Tamil calendars print; Prabhava began at Chithirai 1987
  var SAM = ["Prabhava", "Vibhava", "Shukla", "Pramoduta", "Prajotpatti", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatu", "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vishu",
    "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
    "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit",
    "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala", "Pingala", "Kalayukti", "Siddharthi", "Raudri", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"];
  var SAM_HI = ["प्रभव", "विभव", "शुक्ल", "प्रमोदूत", "प्रजोत्पत्ति", "आंगिरस", "श्रीमुख", "भाव", "युवा", "धाता", "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृष",
    "चित्रभानु", "स्वभानु", "तारण", "पार्थिव", "व्यय", "सर्वजित्", "सर्वधारी", "विरोधी", "विकृति", "खर", "नंदन", "विजय", "जय", "मन्मथ", "दुर्मुखी",
    "हेविलंबी", "विलंबी", "विकारी", "शार्वरी", "प्लव", "शुभकृत्", "शोभकृत्", "क्रोधी", "विश्वावसु", "पराभव", "प्लवंग", "कीलक", "सौम्य", "साधारण", "विरोधकृत्",
    "परिधावी", "प्रमादी", "आनंद", "राक्षस", "नल", "पिंगल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुंदुभि", "रुधिरोद्गारी", "रक्ताक्षी", "क्रोधन", "अक्षय"];

  function utc(a) { return Date.UTC(a[0], a[1] - 1, a[2]); }
  function add(a, n) { var d = new Date(utc(a) + n * DAY); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; }

  /** Local date [y, m, d] a solar month begins, from the UTC ms of its sankranti. */
  PR.monthStart = function (cal, sk, p) {
    var x = PE.localDate(sk, p.tz), s = PE.sun(x[0], x[1], x[2], p);
    if (cal === "tamil") return !s.set || sk < s.set ? x : add(x, 1);
    if (cal === "malayalam") return s.rise && s.set && sk < s.rise + Math.round((s.set - s.rise) * 3 / 5) ? x : add(x, 1);
    // bengali: a sankranti before sunrise belongs to the day before
    var hd = s.rise && sk < s.rise ? add(x, -1) : x, midnight = utc(add(hd, 1)) - p.tz * 3600000;
    return add(hd, sk < midnight ? 1 : 2);
  };

  /** Regional date for the local date [y, m, d], or null. */
  PR.day = function (cal, y, m, d, p) {
    if (!M[cal]) return null;
    var sun = PE.sun(y, m, d, p);
    if (!sun.rise || !PE.inRange(sun.rise)) return null;
    if (cal === "gujarati" || cal === "marathi") {
      var dy = PE.day(y, m, d, p), k = null;
      // a Shukla Pratipada that begins and ends before the next sunrise starts the month that day, as Gudi Padwa and Bestu Varas do
      dy.tithi.slice(1).forEach(function (x) { if (!k && x.v === 0 && x.end && sun.nextRise && x.end <= sun.nextRise) k = x; });
      var mo = k ? PE.month(k.start + MIN) : dy.month, ti = k ? k.v : dy.tithi[0].v, am = mo.amanta, bump = k && am === 0 && !mo.adhik ? 1 : 0;
      var r = { cal: cal, shukla: ti < 15, day: ti % 15 + 1, adhik: mo.adhik };
      if (cal === "gujarati") { r.month = (am + 5) % 12; r.year = dy.vikram + bump - (am < 7 && !(mo.adhik && am === 0) ? 1 : 0); }
      else { r.month = am; r.year = dy.shaka + bump; }
      return r;
    }
    var date = [y, m, d], noon = utc(date) + 12 * 3600000 - p.tz * 3600000, best = null, start = null;
    var list = PE.sankrantis(noon - 40 * DAY, noon + 3 * DAY);
    for (var i = 0; i < list.length; i++) {
      var st = PR.monthStart(cal, list[i].t, p);
      if (utc(st) > utc(date)) break;
      best = list[i]; start = st;
    }
    if (!best) return null;
    var month = cal === "malayalam" ? (best.rashi + 8) % 12 : best.rashi;
    // the year the era year began: far from 1 January either way
    var ny = new Date(best.t - Math.round(month * 30.44 * DAY)).getUTCFullYear(), dayNo = Math.round((utc(date) - utc(start)) / DAY) + 1;
    if (cal === "tamil") return { cal: cal, month: month, day: dayNo, year: ny + (month >= 9 ? 1 : 0) + 31, cycle: ((ny - 1987) % 60 + 60) % 60 };
    return { cal: cal, month: month, day: dayNo, year: cal === "bengali" ? ny - 593 : ny - 824 };
  };

  PR.label = function (r, hi) {
    var mn = M[r.cal][hi ? 1 : 0][r.month], adhik = r.adhik ? (hi ? "अधिक " : "Adhik ") : "", t;
    switch (r.cal) {
      case "tamil": return hi ? mn + " " + r.day + ", " + SAM_HI[r.cycle] + " संवत्सर, तिरुवल्लुवर " + r.year : mn + " " + r.day + ", " + SAM[r.cycle] + " year, Thiruvalluvar " + r.year;
      case "bengali": return r.day + " " + mn + " " + r.year + (hi ? " बंगाब्द" : " Bangabda");
      case "malayalam": return mn + " " + r.day + (hi ? ", कोल्लम वर्ष " : ", Kollam Era ") + r.year;
      case "gujarati":
        t = r.day === 15 ? (r.shukla ? (hi ? "पूनम" : "Punam") : (hi ? "अमास" : "Amas")) : (r.shukla ? (hi ? "सुद" : "Sud") : (hi ? "वद" : "Vad")) + " " + r.day;
        return adhik + mn + " " + t + (hi ? ", विक्रम संवत " : ", Vikram Samvat ") + r.year;
      default:
        t = r.day === 15 ? (r.shukla ? (hi ? "पौर्णिमा" : "Purnima") : (hi ? "अमावस्या" : "Amavasya")) : (r.shukla ? (hi ? "शुद्ध" : "Shuddha") : (hi ? "वद्य" : "Vadya")) + " " + r.day;
        return adhik + mn + " " + t + (hi ? ", शक " : ", Shaka ") + r.year;
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = PR; else root.PR = PR;
})(this);
