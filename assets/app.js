/* Panchang pages: today, month calendar, festival lists. Uses PE (engine.js) and CITIES (cities.js). */
(function () {
  var root = document.documentElement, DAY = 86400000;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var l = store("pc-lang"); if (l === "hi" || l === "en") root.lang = l;
  var th = store("pc-theme"); if (th === "dark" || th === "light") root.setAttribute("data-theme", th);
  function hi() { return root.lang === "hi"; }
  function t(en, h) { return hi() ? h : en; }
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MON_HI = ["जन", "फ़र", "मार्च", "अप्रै", "मई", "जून", "जुला", "अग", "सित", "अक्टू", "नव", "दिस"];
  var MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MONTH_FULL_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  var WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], WD_S = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var WD_S_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

  /* ---------- place ---------- */
  function place() {
    var s = store("pc-place"), p = null;
    try { p = s ? JSON.parse(s) : null; } catch (e) {}
    if (!p) { var c = CITIES[0]; p = { name: c[0], hi: c[1], lat: c[2], lon: c[3], tz: 5.5 }; }
    return p;
  }
  function setPlace(p) { store("pc-place", JSON.stringify(p)); }
  function placeName(p) { return hi() && p.hi ? p.hi : p.name; }

  /* ---------- formats ---------- */
  function ld(ms, tz) { var d = new Date(ms + tz * 3600000); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCDay()]; }
  function hm(ms, p) {
    var x = ld(ms, p.tz), h = x[3], m = x[4], ap = h < 12 ? "AM" : "PM";
    return ((h % 12) || 12) + ":" + String(m).padStart(2, "0") + " " + ap;
  }
  // time, with the date when it is not the day being shown
  function when(ms, p, y, mo, d) {
    if (!ms) return "";
    var x = ld(ms, p.tz), s = hm(ms, p);
    if (x[0] !== y || x[1] !== mo || x[2] !== d) s += ", " + x[2] + " " + (hi() ? MON_HI : MON)[x[1] - 1];
    return s;
  }
  function dateText(y, m, d) { return d + " " + (hi() ? MONTH_FULL_HI : MONTH_FULL)[m - 1] + " " + y; }
  function iso(y, m, d) { return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
  function todayLocal(p) { var x = ld(Date.now(), p.tz); return [x[0], x[1], x[2]]; }
  // Purnima and Amavasya need no paksha in front
  function tithiName(v) { return (v === 14 || v === 29 ? "" : v < 15 ? t("Shukla ", "शुक्ल ") : t("Krishna ", "कृष्ण ")) + (hi() ? PE.TITHI_HI : PE.TITHI)[v]; }
  function nm(list, hiList, v) { return (hi() ? hiList : list)[v]; }

  /* ---------- moon phase icon from the tithi ---------- */
  function moonSvg(v, size) {
    var e = ((v + 0.5) * 12) * Math.PI / 180, k = Math.cos(e), r = 10, waxing = v < 15;
    // lit part: half disc plus an ellipse whose width follows the phase
    var rx = Math.abs(k) * r, sweepOuter = waxing ? 1 : 0, sweepInner = (k > 0) === waxing ? 0 : 1;
    var d = "M12 2 A10 10 0 0 " + sweepOuter + " 12 22 A" + rx.toFixed(2) + " 10 0 0 " + sweepInner + " 12 2Z";
    return '<svg class="moon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--night)"/>' +
      '<path d="' + d + '" fill="#F7E9B8"/></svg>';
  }

  /* ---------- day arc: sunrise to sunset, with Rahu Kaal and friends ---------- */
  function arcSvg(day, p, isToday) {
    var W = 520, H = 290, cx = W / 2, cy = 250, R = 210, rise = day.sun.rise, set = day.sun.set, mu = day.muhurta;
    function pt(ms, rr) { var f = (ms - rise) / (set - rise), a = Math.PI * (1 - f); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; }
    function band(a, b, color, w) {
      var p1 = pt(a, R), p2 = pt(b, R), large = 0;
      return '<path d="M' + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " A" + R + " " + R + " 0 " + large + " 1 " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) +
        '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="butt"/>';
    }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(t("Day from sunrise to sunset", "सूर्योदय से सूर्यास्त तक दिन")) + '">';
    s += '<line x1="20" y1="' + cy + '" x2="' + (W - 20) + '" y2="' + cy + '" stroke="var(--line-2)" stroke-width="2"/>';
    s += band(rise, set, "var(--day)", 26);
    if (mu) {
      s += band(mu.yama[0], mu.yama[1], "color-mix(in srgb, var(--muted) 55%, transparent)", 26);
      s += band(mu.gulika[0], mu.gulika[1], "color-mix(in srgb, var(--muted) 30%, transparent)", 26);
      s += band(mu.rahu[0], mu.rahu[1], "var(--kumkum)", 26);
      if (mu.abhijit) s += band(mu.abhijit[0], mu.abhijit[1], "var(--good)", 26);
    }
    // hour ticks
    for (var h = Math.ceil(rise / 3600000) * 3600000; h < set; h += 3600000) {
      var a = pt(h, R + 18), b = pt(h, R + 24);
      s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="var(--line-2)" stroke-width="2"/>';
    }
    var now = Date.now();
    if (isToday && now > rise && now < set) {
      var c = pt(now, R);
      s += '<circle cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="15" fill="var(--haldi)" stroke="var(--paper)" stroke-width="4"><title>' + esc(t("Now", "अभी")) + "</title></circle>";
    }
    s += '<text x="22" y="' + (cy + 30) + '" font-size="15" fill="var(--muted)">' + esc(t("Sunrise ", "सूर्योदय ") + hm(rise, p)) + "</text>";
    s += '<text x="' + (W - 22) + '" y="' + (cy + 30) + '" font-size="15" fill="var(--muted)" text-anchor="end">' + esc(t("Sunset ", "सूर्यास्त ") + hm(set, p)) + "</text>";
    var len = (set - rise) / 60000;
    s += '<text x="' + cx + '" y="' + (cy - 70) + '" font-size="14" fill="var(--muted)" text-anchor="middle">' + esc(t("Day length", "दिनमान")) + "</text>";
    s += '<text x="' + cx + '" y="' + (cy - 40) + '" font-size="28" fill="var(--ink)" text-anchor="middle" font-family="Tiro Devanagari Hindi, serif">' + Math.floor(len / 60) + t("h ", " घं ") + Math.round(len % 60) + t("m", " मि") + "</text>";
    return s + "</svg>";
  }

  /* ---------- page: today ---------- */
  function renderToday() {
    var p = place(), q = new URLSearchParams(location.search), dv = q.get("date"), td = todayLocal(p), y, m, d;
    if (dv && /^\d{4}-\d\d-\d\d$/.test(dv)) { var a = dv.split("-").map(Number); y = a[0]; m = a[1]; d = a[2]; } else { y = td[0]; m = td[1]; d = td[2]; }
    $("#date").value = iso(y, m, d);
    var day = PE.day(y, m, d, p), isToday = y === td[0] && m === td[1] && d === td[2];
    if (!day.sun.rise || !PE.inRange(day.sun.rise)) { $("#out").innerHTML = '<p class="note">' + t("This date is outside 2025 to 2030.", "यह तारीख 2025 से 2030 के बाहर है।") + "</p>"; return; }
    var ti = day.tithi[0], wd = day.weekday, monthName = function (i) { return nm(PE.MONTH, PE.MONTH_HI, i); };
    var mon = monthName(day.purnimanta) + (day.month.adhik ? t(" (Adhik)", " (अधिक)") : "");
    var fest = PE.festivals([y, m, d], [y, m, d], p), vr = PE.vrats([y, m, d], [y, m, d], p);
    var chips = fest.map(function (f) { return '<span class="chip red">' + esc(hi() ? f.hi : f.en) + "</span>"; }).concat(vr.map(function (v) { return '<span class="chip">' + esc(hi() ? v.hi : v.en) + "</span>"; }));
    var sk = PE.sankrantis(day.sun.rise - DAY / 2, day.sun.rise + DAY / 2);
    sk.forEach(function (s) { chips.push('<span class="chip">' + esc(nm(PE.RASHI, PE.RASHI_HI, s.rashi) + t(" Sankranti ", " संक्रांति ") + hm(s.t, p)) + "</span>"); });

    function limb(k, list, names, extra) {
      var first = list[0], rest = list.slice(1);
      return '<div class="limb"><div class="k">' + k + '</div><div class="v">' + esc(names(first.v)) + (extra ? extra(first.v) : "") + '</div><div class="e">' +
        (first.end ? t("until ", "तक ") + when(first.end, p, y, m, d) : "") + "</div>" +
        rest.map(function (r) { return '<div class="then">' + t("then ", "फिर ") + "<b>" + esc(names(r.v)) + "</b>" + (r.end ? ", " + t("until ", "तक ") + when(r.end, p, y, m, d) : "") + "</div>"; }).join("") + "</div>";
    }
    var mu = day.muhurta;
    var html =
      '<section class="today"><div>' +
      '<div class="date-big">' + esc(dateText(y, m, d)) + "</div>" +
      '<div class="date-sub">' + esc((hi() ? PE.VAAR_HI : WD)[wd] + ", " + placeName(p)) + "</div>" +
      '<div class="tithi-big">' + moonSvg(ti.v, 34).replace('class="moon"', 'style="vertical-align:-6px;margin-right:8px"') + esc(tithiName(ti.v)) +
      "<small>" + esc(mon + t(" month, ", " मास, ") + t("Vikram Samvat ", "विक्रम संवत ") + day.vikram + ", " + t("Shaka ", "शक ") + day.shaka) + "</small></div>" +
      (chips.length ? '<div class="fest-today">' + chips.join("") + "</div>" : "") +
      '</div><div class="arc-wrap">' + arcSvg(day, p, isToday) +
      '<div class="arc-legend"><span style="--c:var(--kumkum)">' + t("Rahu Kaal", "राहु काल") + '</span><span style="--c:var(--good)">' + t("Abhijit", "अभिजित") +
      '</span><span style="--c:color-mix(in srgb, var(--muted) 55%, transparent)">' + t("Yamaganda", "यमगण्ड") + '</span><span style="--c:color-mix(in srgb, var(--muted) 30%, transparent)">' + t("Gulika", "गुलिक") + "</span></div></div></section>" +
      '<div class="limbs">' +
      limb(t("Tithi", "तिथि"), day.tithi, tithiName) +
      limb(t("Nakshatra", "नक्षत्र"), day.nakshatra, function (v) { return nm(PE.NAK, PE.NAK_HI, v); }) +
      limb(t("Yoga", "योग"), day.yoga, function (v) { return nm(PE.YOGA, PE.YOGA_HI, v); }) +
      limb(t("Karana", "करण"), day.karana, function (v) { return PE.karanaName(v, hi()); }) +
      '<div class="limb"><div class="k">' + t("Vaar", "वार") + '</div><div class="v">' + esc(nm(PE.VAAR, PE.VAAR_HI, wd)) + '</div><div class="e">' + esc(hi() ? "" : WD[wd]) + "</div></div>" +
      "</div>" +
      '<div class="two"><div class="box"><h2>' + t("Sun, moon and muhurat", "सूर्य, चंद्र और मुहूर्त") + '</h2><dl class="rows">' +
      row(t("Sunrise", "सूर्योदय"), hm(day.sun.rise, p)) + row(t("Sunset", "सूर्यास्त"), hm(day.sun.set, p)) +
      (mu ? row(t("Rahu Kaal", "राहु काल"), hm(mu.rahu[0], p) + " - " + hm(mu.rahu[1], p), "bad") +
        row(t("Yamaganda", "यमगण्ड"), hm(mu.yama[0], p) + " - " + hm(mu.yama[1], p)) +
        row(t("Gulika Kaal", "गुलिक काल"), hm(mu.gulika[0], p) + " - " + hm(mu.gulika[1], p)) +
        row(t("Abhijit Muhurat", "अभिजित मुहूर्त"), mu.abhijit ? hm(mu.abhijit[0], p) + " - " + hm(mu.abhijit[1], p) : t("None on Wednesday", "बुधवार को नहीं"), "good") : "") +
      row(t("Moon sign", "चंद्र राशि"), day.moonRashi.map(function (r, i) { return nm(PE.RASHI, PE.RASHI_HI, r.v) + (i < day.moonRashi.length - 1 && r.end ? " " + t("until ", "तक ") + when(r.end, p, y, m, d) : ""); }).join(", ")) +
      row(t("Sun sign", "सूर्य राशि"), nm(PE.RASHI, PE.RASHI_HI, day.sunRashi.v)) +
      row(t("Month (Purnimanta)", "मास (पूर्णिमांत)"), mon) +
      row(t("Month (Amanta)", "मास (अमांत)"), monthName(day.month.amanta) + (day.month.adhik ? t(" (Adhik)", " (अधिक)") : "")) +
      row(t("Paksha", "पक्ष"), ti.v < 15 ? t("Shukla (waxing)", "शुक्ल") : t("Krishna (waning)", "कृष्ण")) +
      "</dl></div>" +
      '<div class="box"><h2>' + t("Coming up", "आने वाले पर्व और व्रत") + '</h2><ul class="up" id="up"></ul><p class="note" style="margin-top:10px"><a href="festivals.html">' + t("All festivals of the year", "साल के सभी त्योहार") + "</a></p></div></div>";
    $("#out").innerHTML = html;
    // next 45 days
    var s0 = new Date(Date.UTC(y, m - 1, d) + DAY), e0 = new Date(Date.UTC(y, m - 1, d) + 45 * DAY);
    var a1 = [s0.getUTCFullYear(), s0.getUTCMonth() + 1, s0.getUTCDate()], a2 = [e0.getUTCFullYear(), e0.getUTCMonth() + 1, e0.getUTCDate()];
    var fs = PE.festivals(a1, a2, p), fDays = fs.map(function (f) { return f.date.join("-"); });
    // a plain Purnima or Ekadashi is skipped when a festival already falls on that day
    var items = fs.map(function (f) { return { date: f.date, txt: hi() ? f.hi : f.en, big: true }; })
      .concat(PE.vrats(a1, a2, p).filter(function (v) { return (v.id === "ekadashi" || v.id === "purnima" || v.id === "amavasya") && fDays.indexOf(v.date.join("-")) < 0; }).map(function (v) { return { date: v.date, txt: hi() ? v.hi : v.en }; }));
    items.sort(function (a, b) { return Date.UTC(a.date[0], a.date[1] - 1, a.date[2]) - Date.UTC(b.date[0], b.date[1] - 1, b.date[2]); });
    $("#up").innerHTML = items.slice(0, 9).map(function (it) {
      var wd2 = new Date(Date.UTC(it.date[0], it.date[1] - 1, it.date[2])).getUTCDay();
      return '<li><time>' + it.date[2] + " " + (hi() ? MON_HI : MON)[it.date[1] - 1] + "</time><span>" + (it.big ? "<b>" + esc(it.txt) + "</b>" : esc(it.txt)) + " <small>" + (hi() ? WD_S_HI : WD_S)[wd2] + "</small></span></li>";
    }).join("") || '<li class="note">' + t("Nothing in the next six weeks.", "अगले छह हफ़्तों में कुछ नहीं।") + "</li>";
    document.title = t("Panchang for ", "पंचांग ") + dateText(y, m, d) + " - " + placeName(p);
  }
  function row(k, v, cls) { return '<div class="' + (cls || "") + '"><dt>' + esc(k) + "</dt><dd>" + esc(v) + "</dd></div>"; }

  /* ---------- page: month calendar ---------- */
  function renderCalendar() {
    var p = place(), q = new URLSearchParams(location.search), mv = q.get("month"), td = todayLocal(p), y = td[0], m = td[1];
    if (mv && /^\d{4}-\d\d$/.test(mv)) { y = +mv.slice(0, 4); m = +mv.slice(5); }
    if (y < 2025) { y = 2025; m = 1; } if (y > 2030) { y = 2030; m = 12; }
    $("#month").value = y + "-" + String(m).padStart(2, "0");
    $("#cal-title").textContent = (hi() ? MONTH_FULL_HI : MONTH_FULL)[m - 1] + " " + y;
    var days = new Date(Date.UTC(y, m, 0)).getUTCDate(), first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    var fest = PE.festivals([y, m, 1], [y, m, days], p), vr = PE.vrats([y, m, 1], [y, m, days], p);
    var html = (hi() ? WD_S_HI : WD_S).map(function (w, i) { return '<div class="dow' + (i === 0 ? " sun" : "") + '">' + w + "</div>"; }).join("");
    for (var i = 0; i < first; i++) html += '<div class="cell off" aria-hidden="true"></div>';
    for (var d = 1; d <= days; d++) {
      var sun = PE.sun(y, m, d, p), ti = PE.at("tithi", sun.rise), wd = (first + d - 1) % 7;
      var fe = fest.filter(function (f) { return f.date[2] === d; }), vv = vr.filter(function (v) { return v.date[2] === d && v.id !== "purnima" && v.id !== "amavasya"; });
      var isT = y === td[0] && m === td[1] && d === td[2];
      html += '<a class="cell' + (wd === 0 ? " sun" : "") + (isT ? " today" : "") + '" href="./?date=' + iso(y, m, d) + '"><span class="dn">' + d + "</span>" + moonSvg(ti.v, 14) +
        '<span class="ti">' + esc((ti.v === 14 || ti.v === 29 ? "" : ti.v < 15 ? t("S ", "शु ") : t("K ", "कृ ")) + (hi() ? PE.TITHI_HI : PE.TITHI)[ti.v]) + "</span>" +
        fe.map(function (f) { return '<span class="fe">' + esc(hi() ? f.hi : f.en) + "</span>"; }).join("") +
        vv.map(function (v) { return '<span class="vr">' + esc(hi() ? v.hi : v.en) + "</span>"; }).join("") + "</a>";
    }
    $("#cal").innerHTML = html;
    var mo = PE.month(PE.sun(y, m, 15, p).rise);
    $("#cal-sub").textContent = t("Around the middle of the month: ", "महीने के बीच: ") + nm(PE.MONTH, PE.MONTH_HI, mo.amanta) + (mo.adhik ? t(" (Adhik)", " (अधिक)") : "") + t(" (Amanta). Tithi shown is the one at sunrise in ", " (अमांत)। सूर्योदय की तिथि दिखाई गई है, ") + placeName(p) + ".";
    document.title = t("Hindu Calendar ", "हिंदू कैलेंडर ") + (hi() ? MONTH_FULL_HI : MONTH_FULL)[m - 1] + " " + y + " - " + placeName(p);
  }

  /* ---------- page: festivals of a year ---------- */
  var tab = "fest";
  function renderFestivals() {
    var p = place(), q = new URLSearchParams(location.search), y = +(q.get("year") || todayLocal(p)[0]);
    if (y < 2025 || y > 2030) y = todayLocal(p)[0];
    $("#year").value = y;
    $("#fl-title").textContent = t("Hindu festivals " + y, "हिंदू त्योहार " + y);
    var list;
    if (tab === "fest") list = PE.festivals([y, 1, 1], [y, 12, 31], p).map(function (f) { return { date: f.date, txt: hi() ? f.hi : f.en }; });
    else if (tab === "sankranti") list = PE.sankrantis(Date.UTC(y, 0, 1) - 5.5 * 3600000, Date.UTC(y + 1, 0, 1) - 5.5 * 3600000).map(function (s) {
      var x = ld(s.t, p.tz); return { date: [x[0], x[1], x[2]], txt: nm(PE.RASHI, PE.RASHI_HI, s.rashi) + t(" Sankranti, ", " संक्रांति, ") + hm(s.t, p) };
    });
    else list = PE.vrats([y, 1, 1], [y, 12, 31], p).filter(function (v) { return tab === "pa" ? (v.id === "purnima" || v.id === "amavasya") : v.id === tab; }).map(function (v) {
      var mo = PE.month(PE.sun(v.date[0], v.date[1], v.date[2], p).rise);
      return { date: v.date, txt: (hi() ? v.hi : v.en) + (v.id !== "purnima" && v.id !== "amavasya" ? (v.paksha === "S" ? t(", Shukla", ", शुक्ल") : t(", Krishna", ", कृष्ण")) : "") + ", " + nm(PE.MONTH, PE.MONTH_HI, PE.purnimanta(mo, v.paksha === "S" ? 0 : 20)) + (mo.adhik ? t(" (Adhik)", " (अधिक)") : "") };
    });
    $("#fl").innerHTML = list.map(function (it) {
      var wd = new Date(Date.UTC(it.date[0], it.date[1] - 1, it.date[2])).getUTCDay();
      return '<li><time datetime="' + iso(it.date[0], it.date[1], it.date[2]) + '"><a href="./?date=' + iso(it.date[0], it.date[1], it.date[2]) + '">' + it.date[2] + " " + (hi() ? MON_HI : MON)[it.date[1] - 1] + '</a><span class="wd">' + (hi() ? PE.VAAR_HI : WD)[wd] + "</span></time><b>" + esc(it.txt) + "</b></li>";
    }).join("");
    document.querySelectorAll(".tabs button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.tab === tab); });
  }

  /* ---------- shared controls ---------- */
  function fillCities(sel) {
    var p = place();
    sel.innerHTML = CITIES.map(function (c, i) { return '<option value="' + i + '">' + esc(hi() ? c[1] : c[0]) + "</option>"; }).join("") +
      (p.custom ? '<option value="here" selected>' + esc(t("My location", "मेरी जगह")) + "</option>" : "");
    if (!p.custom) { var i = CITIES.findIndex(function (c) { return c[0] === p.name; }); sel.value = i < 0 ? 0 : i; }
  }
  var render = function () {};
  document.addEventListener("DOMContentLoaded", function () {
    var lb = $("#lang-btn");
    function paint() { if (lb) { lb.textContent = hi() ? "EN" : "हिं"; lb.title = hi() ? "Switch to English" : "हिंदी में देखें"; } }
    paint();
    var tb = $("#theme-btn");
    if (tb) tb.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" || (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      root.setAttribute("data-theme", dark ? "light" : "dark"); store("pc-theme", dark ? "light" : "dark");
    });
    var nb = $("#nav-btn"), nav = $("#nav");
    if (nb && nav) nb.addEventListener("click", function () { nb.setAttribute("aria-expanded", nav.classList.toggle("open")); });
    var y = $("#year-now"); if (y) y.textContent = new Date().getFullYear();
    if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function () {});

    var page = document.body.dataset.page;
    if (!page || page === "info") { if (lb) lb.addEventListener("click", function () { root.lang = hi() ? "en" : "hi"; store("pc-lang", root.lang); paint(); }); return; }
    render = page === "today" ? renderToday : page === "calendar" ? renderCalendar : renderFestivals;
    var city = $("#city");
    fetch("assets/events.json").then(function (r) { return r.json(); }).then(function (j) {
      PE.load(j);
      fillCities(city);
      render();
    }).catch(function () { $("#out, #cal, #fl") && ($("#out") || $("#cal") || $("#fl")).insertAdjacentHTML("beforebegin", '<p class="note">' + t("Could not load the calendar data. Check your connection and reload.", "कैलेंडर डेटा लोड नहीं हुआ। इंटरनेट जाँचकर पेज दोबारा खोलें।") + "</p>"); });
    if (lb) lb.addEventListener("click", function () { root.lang = hi() ? "en" : "hi"; store("pc-lang", root.lang); paint(); fillCities(city); render(); });
    city.addEventListener("change", function () {
      if (city.value === "here") return;
      var c = CITIES[+city.value]; setPlace({ name: c[0], hi: c[1], lat: c[2], lon: c[3], tz: 5.5 }); render();
    });
    var gps = $("#gps");
    if (gps) gps.addEventListener("click", function () {
      if (!navigator.geolocation) return;
      gps.disabled = true;
      navigator.geolocation.getCurrentPosition(function (pos) {
        setPlace({ name: "My location", hi: "मेरी जगह", lat: pos.coords.latitude, lon: pos.coords.longitude, tz: -new Date().getTimezoneOffset() / 60, custom: true });
        fillCities(city); render(); gps.disabled = false;
      }, function () { gps.disabled = false; alert(t("Location was not shared. Pick a city instead.", "जगह साझा नहीं हुई। कोई शहर चुनें।")); }, { timeout: 10000 });
    });
    var dt = $("#date");
    if (dt) dt.addEventListener("change", function () { if (dt.value) { history.replaceState(null, "", "?date=" + dt.value); render(); } });
    var prev = $("#prev"), next = $("#next");
    function shift(n) {
      if (page === "today") { var a = dt.value.split("-").map(Number), x = new Date(Date.UTC(a[0], a[1] - 1, a[2]) + n * DAY); history.replaceState(null, "", "?date=" + iso(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate())); }
      else { var mv = $("#month").value.split("-").map(Number), mm = mv[1] + n, yy = mv[0]; if (mm < 1) { mm = 12; yy--; } if (mm > 12) { mm = 1; yy++; } history.replaceState(null, "", "?month=" + yy + "-" + String(mm).padStart(2, "0")); }
      render();
    }
    if (prev) prev.addEventListener("click", function () { shift(-1); });
    if (next) next.addEventListener("click", function () { shift(1); });
    var mo = $("#month"); if (mo) mo.addEventListener("change", function () { history.replaceState(null, "", "?month=" + mo.value); render(); });
    var yr = $("#year"); if (yr) yr.addEventListener("change", function () { history.replaceState(null, "", "?year=" + yr.value); render(); });
    document.querySelectorAll(".tabs button").forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.tab; render(); }); });
    var td = $("#today-btn"); if (td) td.addEventListener("click", function () { history.replaceState(null, "", location.pathname); render(); });
  });
})();
