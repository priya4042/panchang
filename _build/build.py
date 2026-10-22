# -*- coding: utf-8 -*-
"""Builds the Panchang pages. Run: python _build/build.py  (python _build/gen_events.py refreshes the astronomy data)."""
import os, html, json

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://priya4042.github.io/panchang/"
esc = lambda s: html.escape(str(s), quote=True)
def bi(en, hi): return f'<span data-only="en">{esc(en)}</span><span data-only="hi">{esc(hi)}</span>'

LOGO = ('<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M3 24h28" stroke="#B71C1C" stroke-width="2.4" stroke-linecap="round"/>'
        '<path d="M8 24a9 9 0 0 1 18 0z" fill="#E8A317"/>'
        '<g stroke="#E8A317" stroke-width="2.2" stroke-linecap="round"><path d="M17 8v3M8.5 11.5l2 2M25.5 11.5l-2 2M4.5 19h2.5M27 19h2.5"/></g>'
        '<circle cx="17" cy="29" r="2" fill="#B71C1C"/></svg>')

def head(title, desc, path, extra=""):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{BASE}{path}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{BASE}assets/og.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#B71C1C">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap">
<link rel="stylesheet" href="assets/panchang.css">
<link rel="preload" href="assets/events.json" as="fetch" crossorigin>
{extra}</head>
'''

def header(cur):
    links = [("./", "Today", "आज का पंचांग"), ("calendar.html", "Calendar", "कैलेंडर"), ("festivals.html", "Festivals", "त्योहार"), ("muhurat.html", "Muhurat", "मुहूर्त")]
    here = ' aria-current="page"'
    nav = "".join(f'<a href="{h}"{here if h == cur else ""}>{bi(e, i)}</a>' for h, e, i in links)
    return f'''<a class="skip" href="#main">{bi("Skip to content", "सामग्री पर जाएँ")}</a>
<header class="top"><div class="wrap">
  <a class="brand" href="./">{LOGO}<span>{bi("Panchang", "पंचांग")}</span></a>
  <nav class="nav" id="nav" aria-label="Main">{nav}</nav>
  <button class="tbtn nav-tog" id="nav-btn" aria-controls="nav" aria-expanded="false" aria-label="Menu">&#9776;</button>
  <button class="tbtn" id="lang-btn" type="button">हिं</button>
  <button class="tbtn" id="theme-btn" type="button" aria-label="Dark or light theme">&#9681;</button>
</div></header>
'''

def footer():
    return f'''<footer class="foot"><div class="wrap">
  <span>&copy; <span id="year-now">2026</span> {bi("Panchang. A free tool by", "पंचांग। एक मुफ़्त टूल,")} <a href="https://priya4042.github.io/">Priya Tech Labs</a>. <a href="privacy.html">{bi("Privacy", "प्राइवेसी")}</a></span>
  <nav aria-label="Footer"><a href="./">{bi("Today", "आज")}</a><a href="calendar.html">{bi("Calendar", "कैलेंडर")}</a><a href="festivals.html">{bi("Festivals", "त्योहार")}</a><a href="about.html">{bi("How it is calculated", "गणना कैसे होती है")}</a></nav>
  <span>{bi("Lahiri ayanamsa. Times for the chosen city. Local traditions can differ by a day.", "लाहिड़ी अयनांश। समय चुने गए शहर के अनुसार। स्थानीय परंपरा में एक दिन का अंतर हो सकता है।")}</span>
</div></footer>
<script src="assets/cities.js"></script>
<script src="assets/engine.js"></script>
<script src="assets/moon.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
'''

def place_bar(extra):
    gps = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/></svg>'
    return f'''<div class="bar">
    <div class="fld"><label for="city">{bi("City", "शहर")}</label><select id="city"></select></div>
    <button class="btn" id="gps" type="button">{gps}{bi("Use my location", "मेरी जगह")}</button>
    {extra}
  </div>'''

ARROWS = ('<button class="btn" id="prev" type="button" aria-label="Previous">&#8592;</button>', '<button class="btn" id="next" type="button" aria-label="Next">&#8594;</button>')

def today():
    ld = {"@context": "https://schema.org", "@type": "WebApplication", "name": "Panchang", "url": BASE, "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Any", "inLanguage": ["en-IN", "hi-IN"], "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"}}
    faq = [("What is a Panchang?", "पंचांग क्या है?", "A Hindu almanac of five parts for each day: tithi (lunar day), nakshatra (the Moon's star), yoga, karana (half tithi) and vaar (weekday). Festivals, fasts and muhurat are chosen from it.",
            "हर दिन के पाँच अंगों वाला हिंदू कैलेंडर: तिथि, नक्षत्र, योग, करण और वार। त्योहार, व्रत और मुहूर्त इसी से तय होते हैं।"),
           ("Why does the tithi change in the middle of the day?", "तिथि दिन के बीच में क्यों बदलती है?", "A tithi is the time the Moon takes to move 12 degrees ahead of the Sun, so it can end at any hour. The tithi at sunrise is the one the day is named after.",
            "तिथि वह समय है जिसमें चंद्रमा सूर्य से 12 अंश आगे बढ़ता है, इसलिए यह किसी भी समय खत्म हो सकती है। दिन का नाम सूर्योदय की तिथि से होता है।"),
           ("What is Rahu Kaal?", "राहु काल क्या है?", "About an hour and a half each day, one eighth of the time between sunrise and sunset, that many people avoid for starting new work. Its place changes with the weekday.",
            "हर दिन लगभग डेढ़ घंटे का समय, सूर्योदय से सूर्यास्त के बीच का आठवाँ भाग, जिसमें कई लोग नया काम शुरू नहीं करते। यह वार के अनुसार बदलता है।")]
    faqs = "".join(f"<details><summary>{bi(q, qh)}</summary><p>{bi(a, ah)}</p></details>" for q, qh, a, ah in faq)
    body = f'''<body data-page="today">
{header("./")}
<main id="main" class="wrap">
  {place_bar(f'<div class="fld"><label for="date">{bi("Date", "तारीख")}</label><input type="date" id="date" min="2025-01-01" max="2030-12-31"></div>{ARROWS[0]}<button class="btn" id="today-btn" type="button">{bi("Today", "आज")}</button>{ARROWS[1]}')}
  <div id="out" aria-live="polite"><p class="note">{bi("Working out the panchang...", "पंचांग बन रहा है...")}</p></div>
  <section class="sec"><h2>{bi("Questions", "सवाल")}</h2><div class="faq">{faqs}</div></section>
</main>
'''
    return head("Today's Panchang - Tithi, Nakshatra, Rahu Kaal, Muhurat", "Today's Hindu panchang for your city: tithi, nakshatra, yoga, karana, sunrise, sunset, Rahu Kaal, Abhijit muhurat and upcoming festivals. In English and Hindi.", "",
                '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n') + body + footer()

def calendar():
    body = f'''<body data-page="calendar">
{header("calendar.html")}
<main id="main" class="wrap">
  {place_bar(f'<div class="fld"><label for="month">{bi("Month", "महीना")}</label><input type="month" id="month" min="2025-01" max="2030-12"></div>{ARROWS[0]}{ARROWS[1]}')}
  <div class="cal-head"><h1 id="cal-title" style="margin:0"></h1></div>
  <p class="note" id="cal-sub"></p>
  <div class="cal" id="cal" aria-live="polite"></div>
  <p class="note" style="margin-top:12px">{bi("Tap a day for its full panchang.", "पूरे पंचांग के लिए किसी दिन पर टैप करें।")}</p>
</main>
'''
    return head("Hindu Calendar with Tithi and Festivals - Panchang", "Month view Hindu calendar with the tithi of every day, moon phase, festivals, Ekadashi and Pradosh, for your city. 2025 to 2030.", "calendar.html") + body + footer()

def festivals():
    tabs = [("fest", "Festivals", "त्योहार"), ("ekadashi", "Ekadashi", "एकादशी"), ("pa", "Purnima and Amavasya", "पूर्णिमा और अमावस्या"), ("pradosh", "Pradosh", "प्रदोष"),
            ("sankashti", "Sankashti Chaturthi", "संकष्टी चतुर्थी"), ("shivratri", "Masik Shivratri", "मासिक शिवरात्रि"), ("sankranti", "Sankranti", "संक्रांति")]
    tb = "".join(f'<button type="button" data-tab="{k}" aria-pressed="{str(k == "fest").lower()}">{bi(e, h)}</button>' for k, e, h in tabs)
    years = "".join(f'<option value="{y}">{y}</option>' for y in range(2025, 2031))
    body = f'''<body data-page="festivals">
{header("festivals.html")}
<main id="main" class="wrap">
  {place_bar(f'<div class="fld"><label for="year">{bi("Year", "साल")}</label><select id="year">{years}</select></div>')}
  <h1 id="fl-title" style="margin-top:12px"></h1>
  <div class="tabs" role="group" aria-label="List">{tb}</div>
  <ul class="fl" id="fl" aria-live="polite"></ul>
  <p class="note" style="margin-top:14px">{bi("Dates follow the rules most North Indian panchangs use, for the chosen city. Some regions keep a festival one day apart; check with your temple or family tradition.", "तारीखें चुने गए शहर के लिए उत्तर भारतीय पंचांगों के नियमों से हैं। कुछ क्षेत्रों में त्योहार एक दिन आगे-पीछे मनाया जाता है; अपने मंदिर या परिवार की परंपरा से मिलाएँ।")}</p>
</main>
'''
    return head("Hindu Festivals, Ekadashi and Vrat Dates 2025 to 2030 - Panchang", "Every Hindu festival, Ekadashi, Purnima, Amavasya, Pradosh, Sankashti and Sankranti date for 2025 to 2030, worked out for your city.", "festivals.html") + body + footer()

def muhurat():
    kinds = [("vivah", "Marriage", "विवाह"), ("griha", "Griha pravesh", "गृह प्रवेश"), ("vehicle", "Vehicle", "वाहन"), ("property", "Property", "संपत्ति"), ("namkaran", "Naming", "नामकरण")]
    tb = "".join(f'<button type="button" data-kind="{k}" aria-pressed="{str(k == "vivah").lower()}">{bi(e, h)}</button>' for k, e, h in kinds)
    body = f'''<body data-page="muhurat">
{header("muhurat.html")}
<main id="main" class="wrap">
  {place_bar("")}
  <h1 id="mu-title" style="margin-top:12px"></h1>
  <div class="tabs" role="group" aria-label="Kind">{tb}</div>
  <ul class="fl" id="mu" aria-live="polite"></ul>
  <p class="note" style="margin-top:14px">{bi("These days pass the basic panchang checks used for this kind of work: a suitable nakshatra, tithi and weekday, and no Adhik maas, Kharmas, Amavasya or Rikta tithi (and no Chaturmas for marriage). They do not look at Jupiter or Venus being combust or at anyone's birth chart, so confirm the final muhurat with your family priest.", "ये दिन इस काम के लिए पंचांग की बुनियादी जाँचों में सही हैं: उपयुक्त नक्षत्र, तिथि और वार, और अधिक मास, खरमास, अमावस्या या रिक्ता तिथि नहीं (विवाह के लिए चातुर्मास भी नहीं)। इनमें गुरु या शुक्र के अस्त होने और किसी की जन्म कुंडली को नहीं देखा गया है, इसलिए अंतिम मुहूर्त अपने पुरोहित से पक्का करें।")}</p>
</main>
'''
    return head("Shubh Muhurat Dates - Marriage, Griha Pravesh, Vehicle - Panchang", "Good days in the next twelve months for marriage, griha pravesh, vehicle and property purchase and naming, from basic panchang rules, for your city.", "muhurat.html") + body + footer()

def about():
    paras = [("The Sun and Moon positions come from astronomy-engine, an open-source library that is accurate to well under a minute of arc. Every change of tithi, nakshatra, yoga, karana and sankranti from 2025 to 2030 was worked out once and is stored in a small file, so the site also works offline.",
              "सूर्य और चंद्रमा की स्थिति astronomy-engine से ली गई है, जो एक ओपन-सोर्स लाइब्रेरी है और बहुत सटीक है। 2025 से 2030 तक तिथि, नक्षत्र, योग, करण और संक्रांति का हर बदलाव एक बार निकालकर छोटी फ़ाइल में रखा गया है, इसलिए साइट ऑफ़लाइन भी चलती है।"),
             ("Nakshatra, yoga and the signs use the Lahiri (Chitrapaksha) ayanamsa, the one the Government of India's calendar uses. Sankranti moments were checked against published 2026 times and match to the minute.",
              "नक्षत्र, योग और राशियाँ लाहिड़ी (चित्रपक्ष) अयनांश से हैं, जिसे भारत सरकार का कैलेंडर इस्तेमाल करता है। संक्रांति के समय 2026 के प्रकाशित समय से मिलाए गए और मिनट तक सही हैं।"),
             ("Sunrise and sunset are worked out for the chosen city. The tithi of a day is the one current at sunrise. Rahu Kaal, Yamaganda and Gulika are eighths of the daytime, by weekday. Abhijit Muhurat is the middle fifteenth of the day.",
              "सूर्योदय और सूर्यास्त चुने गए शहर के लिए निकाले जाते हैं। दिन की तिथि वह है जो सूर्योदय पर चल रही हो। राहु काल, यमगण्ड और गुलिक दिन के आठवें भाग हैं, वार के अनुसार। अभिजित मुहूर्त दिन का बीच का पंद्रहवाँ भाग है।"),
             ("Months are Amanta (new moon to new moon) and named by the Sun's sign at the new moon; a month with no sankranti is Adhik. Festivals use the time of day each one needs: Diwali in the evening (pradosh), Janmashtami and Maha Shivratri at midnight (nishita), Ganesh Chaturthi at midday, Dussehra in the afternoon. The 2026 and 2027 dates were checked against published calendars.",
              "महीने अमांत हैं (अमावस्या से अमावस्या) और अमावस्या पर सूर्य की राशि से नाम पाते हैं; जिस महीने में संक्रांति न हो वह अधिक मास है। हर त्योहार उसी समय से तय होता है जो उसे चाहिए: दीपावली प्रदोष में, जन्माष्टमी और महाशिवरात्रि निशीथ में, गणेश चतुर्थी मध्याह्न में, दशहरा अपराह्न में। 2026 और 2027 की तारीखें प्रकाशित कैलेंडरों से मिलाई गईं।")]
    body = f'''<body data-page="info">
{header("about.html")}
<main id="main" class="wrap"><section class="sec" style="max-width:48rem;padding-top:24px">
<h1>{bi("How the panchang is calculated", "पंचांग की गणना कैसे होती है")}</h1>
{"".join(f"<p>{bi(e, h)}</p>" for e, h in paras)}
</section></main>
'''
    return head("How the Panchang is Calculated", "Methods behind the panchang: astronomy-engine positions, Lahiri ayanamsa, sunrise-based tithi and festival rules.", "about.html") + body + footer()

def privacy():
    paras = [("Everything is worked out in your browser. If you tap Use my location, your position is used on your device only and kept in your browser so the page opens for the same place next time. It is never sent to us.",
              "सारी गणना आपके ब्राउज़र में होती है। अगर आप 'मेरी जगह' दबाते हैं, तो आपकी लोकेशन सिर्फ़ आपके फ़ोन पर इस्तेमाल होती है और ब्राउज़र में रखी जाती है ताकि अगली बार वही जगह खुले। यह हमें कभी नहीं भेजी जाती।"),
             ("Your browser also remembers your language and theme. The site is hosted on GitHub Pages and loads fonts from Google Fonts.", "आपका ब्राउज़र भाषा और थीम भी याद रखता है। साइट GitHub Pages पर है और फ़ॉन्ट Google Fonts से लेती है।")]
    body = f'''<body data-page="info">
{header("privacy.html")}
<main id="main" class="wrap"><section class="sec" style="max-width:48rem;padding-top:24px">
<h1>{bi("Privacy", "प्राइवेसी")}</h1>{"".join(f"<p>{bi(e, h)}</p>" for e, h in paras)}
<p><a href="mailto:priyatechlabs9@gmail.com">priyatechlabs9@gmail.com</a></p></section></main>
'''
    return head("Privacy - Panchang", "The panchang works in your browser; your location never leaves your device.", "privacy.html") + body + footer()

def write(name, s):
    open(os.path.join(R, name), "w", encoding="utf-8", newline="\n").write(s); print("built", name)

if __name__ == "__main__":
    write("index.html", today()); write("calendar.html", calendar()); write("festivals.html", festivals()); write("muhurat.html", muhurat()); write("about.html", about()); write("privacy.html", privacy())
    open(os.path.join(R, "assets", "icon.svg"), "w", encoding="utf-8").write(LOGO.replace('<svg viewBox', '<svg xmlns="http://www.w3.org/2000/svg" viewBox').replace(' aria-hidden="true"', ''))
    urls = ["", "calendar.html", "festivals.html", "muhurat.html", "about.html", "privacy.html"]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{BASE}{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    write("manifest.webmanifest", json.dumps({"name": "Panchang - Tithi, Muhurat and Festivals", "short_name": "Panchang", "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": "#FFFFFF", "theme_color": "#B71C1C", "lang": "en-IN", "icons": [{"src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png"}, {"src": "assets/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=2))
    core = ["./", "index.html", "calendar.html", "festivals.html", "about.html", "privacy.html", "assets/panchang.css", "assets/app.js", "assets/engine.js", "assets/moon.js", "assets/cities.js", "muhurat.html", "assets/events.json", "assets/icon.svg"]
    write("sw.js", '''// Network first so updates show at once; cached copy when offline.
var CACHE = "panchang-v2";
var CORE = ''' + json.dumps(core) + ''';
self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok && (new URL(e.request.url).origin === location.origin || e.request.url.indexOf("fonts.") > -1)) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match("./"); }); }));
});
''')
