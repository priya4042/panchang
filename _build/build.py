# -*- coding: utf-8 -*-
"""Builds the Panchang pages. Run: python _build/build.py  (python _build/gen_events.py refreshes the astronomy data)."""
import os, html, json, subprocess, datetime

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
    links = [("./", "Today", "आज का पंचांग"), ("calendar.html", "Calendar", "कैलेंडर"), ("festivals.html", "Festivals", "त्योहार"), ("muhurat.html", "Muhurat", "मुहूर्त"), ("rashi.html", "Rashi", "राशि")]
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
    return f'''<aside class="get-app" aria-label="Android app"><div class="wrap"><img src="https://priya4042.github.io/assets/apps/panchang.png" alt="" width="52" height="52" loading="lazy"><p><b>{bi("Get the Panchang app", "Panchang ऐप पाएँ")}</b><span>{bi("Works offline, with reminders and more. Free for Android.", "ऑफ़लाइन चलता है, रिमाइंडर और भी बहुत कुछ। Android के लिए मुफ़्त।")}</span></p><a class="get-btn" href="https://github.com/priya4042/priya4042.github.io/releases/download/apps/panchang-1.0.0-arm64.apk" download>{bi("Download for Android", "Android के लिए डाउनलोड")} <small>APK, 32 MB</small></a><span class="get-more"><a href="https://github.com/priya4042/priya4042.github.io/releases/download/apps/panchang-1.0.0-old-phones.apk" download>{bi("Older phone?", "पुराना फ़ोन?")}</a> &middot; <a href="https://priya4042.github.io/download.html#how">{bi("How to install", "इंस्टॉल कैसे करें")}</a></span></div></aside><footer class="foot"><div class="wrap">
  <span>&copy; <span id="year-now">2026</span> {bi("Panchang. A free tool by", "पंचांग। एक मुफ़्त टूल,")} <a href="https://priya4042.github.io/">Priya Tech Labs</a>. <a href="privacy.html">{bi("Privacy", "प्राइवेसी")}</a></span>
  <nav aria-label="Footer"><a href="./">{bi("Today", "आज")}</a><a href="calendar.html">{bi("Calendar", "कैलेंडर")}</a><a href="festivals.html">{bi("Festivals", "त्योहार")}</a><a href="rashi.html">{bi("Birth rashi", "जन्म राशि")}</a><a href="about.html">{bi("How it is calculated", "गणना कैसे होती है")}</a></nav>
  <span>{bi("Lahiri ayanamsa. Times for the chosen city. Local traditions can differ by a day.", "लाहिड़ी अयनांश। समय चुने गए शहर के अनुसार। स्थानीय परंपरा में एक दिन का अंतर हो सकता है।")}</span>
</div></footer>
<script src="assets/cities.js"></script>
<script src="assets/engine.js"></script>
<script src="assets/moon.js"></script>
<script src="assets/regional.js"></script>
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
  {place_bar(f'<div class="fld"><label for="date">{bi("Date", "तारीख")}</label><input type="date" id="date" min="2025-01-01" max="2030-12-31"></div>{ARROWS[0]}<button class="btn" id="today-btn" type="button">{bi("Today", "आज")}</button>{ARROWS[1]}<div class="fld"><label for="regional">{bi("Regional calendar", "क्षेत्रीय कैलेंडर")}</label><select id="regional"></select></div>')}
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
  <section class="sec"><h2>{bi("Why and how each one is observed", "हर त्योहार क्यों और कैसे मनाया जाता है")}</h2>{fest_links()}</section>
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

STORIES = json.load(open(os.path.join(R, "data", "stories.json"), encoding="utf-8"))["stories"]
VRAT_IDS = ["ekadashi", "pradosh", "sankashti", "shivratri", "purnima", "amavasya"]
FEST_IDS = [k for k in STORIES if k not in VRAT_IDS]
YEAR = min(max(datetime.date.today().year, 2025), 2030)
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
MON_HI = ["जन", "फ़र", "मार्च", "अप्रै", "मई", "जून", "जुला", "अग", "सित", "अक्टू", "नव", "दिस"]
WD = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
WD_HI = ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"]

def fest_dates():
    out = subprocess.run(["node", os.path.join(R, "_build", "fest_dates.js"), str(YEAR)], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))

def fest_links(skip=None):
    def links(ids): return "".join(f'<a class="chip" href="{k}.html">{bi(STORIES[k]["en"], STORIES[k]["hi"])}</a>' for k in ids if k != skip)
    return f'<div class="links">{links(FEST_IDS)}</div><h3 style="margin-top:18px">{bi("Monthly vrats", "मासिक व्रत")}</h3><div class="links">{links(VRAT_IDS)}</div>'

def fest_page(k, dates):
    st, vrat = STORIES[k], k in VRAT_IDS
    def li(d, en="", hi=""):
        dt = datetime.date(*d)
        return (f'<li><time datetime="{dt.isoformat()}"><a href="./?date={dt.isoformat()}">{bi(f"{d[2]} {MON[d[1] - 1]} {d[0]}", f"{d[2]} {MON_HI[d[1] - 1]} {d[0]}")}</a>'
                f'<span class="wd">{bi(WD[dt.weekday()], WD_HI[dt.weekday()])}</span></time><b>{bi(en, hi) if en else ""}</b></li>')
    rows = "".join(li(d[0], d[1][0], d[1][1]) for d in dates) if vrat else "".join(li(d) for d in dates)
    years = f"{YEAR}" if vrat else "2025 to 2030"
    title = f'{st["en"]} {"Dates " + str(YEAR) if vrat else "Dates 2025 to 2030"} - Why and How It Is Observed'
    desc = st["why_en"].split(". ")[0].rstrip(".") + f'. Dates for {years}, why it is observed and how.'
    body = f'''<body data-page="fest" data-fest="{k}" data-kind="{"vrat" if vrat else "fest"}">
{header("festivals.html")}
<main id="main" class="wrap">
  {place_bar("")}
  <article class="sec story">
  <p class="note" style="margin:10px 0 0"><a href="festivals.html">{bi("All festivals", "सभी त्योहार")}</a></p>
  <h1>{bi(st["en"], st["hi"])}</h1>
  <h2>{bi("Dates", "तारीखें")}</h2>
  <ul class="fl" id="fd" aria-live="polite">{rows}</ul>
  <p class="note" id="fd-note">{bi(f"Dates for New Delhi, {years}. Pick your city above.", f"नई दिल्ली की तारीखें, {years}। ऊपर अपना शहर चुनें।")}</p>
  <h2>{bi("Why it is observed", "क्यों मनाया जाता है")}</h2>
  <p>{bi(st["why_en"], st["why_hi"])}</p>
  <h2>{bi("How it is observed", "कैसे मनाया जाता है")}</h2>
  <p>{bi(st["how_en"], st["how_hi"])}</p>
  <p class="note">{bi("Customs and dates can differ by region and family tradition; check with your temple or family priest.", "रीति-रिवाज और तारीखें क्षेत्र और परिवार की परंपरा के अनुसार अलग हो सकती हैं; अपने मंदिर या पुरोहित से मिलाएँ।")}</p>
  <h2>{bi("Other festivals", "दूसरे त्योहार")}</h2>
  {fest_links(k)}
  </article>
</main>
'''
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc, "inLanguage": ["en-IN", "hi-IN"], "url": BASE + k + ".html"}
    return head(title, desc, k + ".html", '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n') + body + footer()

def rashi():
    zones = [("IN", "India (IST, with the 1942-45 war time)", "भारत (IST, 1942-45 का युद्धकालीन समय सहित)")] + [
        (str(h), f"UTC{'+' if h >= 0 else '-'}{int(abs(h))}:{int(round(abs(h) % 1 * 60)):02d}", f"UTC{'+' if h >= 0 else '-'}{int(abs(h))}:{int(round(abs(h) % 1 * 60)):02d}")
        for h in [5.75, 6, 6.5, 5, 4, 3, 2, 1, 0, -3, -4, -5, -6, -7, -8, 7, 8, 9, 10, 11, 12]]
    opts = "".join(f'<option value="{v}">{esc(e)}</option>' for v, e, h in zones)
    body = f'''<body data-page="rashi">
{header("rashi.html")}
<main id="main" class="wrap">
  <section class="sec" style="padding-top:20px">
  <h1>{bi("Birth rashi and nakshatra", "जन्म राशि और नक्षत्र")}</h1>
  <p>{bi("Enter the date and time of birth to see the Moon sign (rashi), the nakshatra with its pada, and the Sun sign, by the sidereal zodiac Indian panchangs use.", "जन्म की तारीख और समय भरें और देखें चंद्र राशि, नक्षत्र और उसका पद, और सूर्य राशि, उसी निरयन पद्धति से जो भारतीय पंचांग लेते हैं।")}</p>
  <div class="bar">
    <div class="fld"><label for="bdate">{bi("Date of birth", "जन्म की तारीख")}</label><input type="date" id="bdate" min="1900-01-01" max="2100-12-31"></div>
    <div class="fld"><label for="btime">{bi("Time of birth", "जन्म का समय")}</label><input type="time" id="btime"></div>
    <div class="fld"><label for="bzone">{bi("Time zone", "समय क्षेत्र")}</label><select id="bzone">{opts}</select></div>
  </div>
  <div id="rout" aria-live="polite"></div>
  <p class="note" style="margin-top:16px;max-width:48rem">{bi("Positions are geocentric with the Lahiri ayanamsa, the same as the rest of this site; the Moon's place is accurate to within about two minutes of birth time. For India the clock offset of the date is used, including the war time of 1942 to 1945 (UTC+6:30); before 1955 some cities kept their own local time (Bombay and Calcutta time), so use the time zone the birth record used. For a birth abroad, pick the offset that was in force that day, daylight saving included. This shows positions only and makes no predictions.", "स्थितियाँ भू-केंद्रीय हैं और लाहिड़ी अयनांश से हैं, जैसे इस साइट पर बाकी सब; चंद्रमा की स्थिति जन्म समय के लगभग दो मिनट के भीतर सही है। भारत के लिए उस तारीख का घड़ी समय लिया जाता है, 1942 से 1945 का युद्धकालीन समय (UTC+6:30) भी; 1955 से पहले कुछ शहर अपना स्थानीय समय (बॉम्बे और कलकत्ता टाइम) रखते थे, इसलिए जन्म प्रमाण पत्र वाला समय क्षेत्र लें। विदेश में जन्म हो तो उस दिन लागू समय (डेलाइट सेविंग सहित) चुनें। यह केवल ग्रह स्थिति दिखाता है, कोई भविष्यवाणी नहीं करता।")}</p>
  </section>
</main>
'''
    return head("Birth Rashi and Nakshatra Finder - Moon Sign by Date of Birth", "Find your Moon sign (rashi), nakshatra with pada and sidereal Sun sign from the date and time of birth, with the Lahiri ayanamsa. Births from 1900 to 2100.", "rashi.html") + body + footer()

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
    write("rashi.html", rashi())
    fd = fest_dates()
    for k in STORIES: write(k + ".html", fest_page(k, fd.get(k, [])))
    open(os.path.join(R, "assets", "icon.svg"), "w", encoding="utf-8").write(LOGO.replace('<svg viewBox', '<svg xmlns="http://www.w3.org/2000/svg" viewBox').replace(' aria-hidden="true"', ''))
    urls = ["", "calendar.html", "festivals.html", "muhurat.html", "rashi.html", "about.html", "privacy.html"] + [k + ".html" for k in STORIES]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{BASE}{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    write("manifest.webmanifest", json.dumps({"name": "Panchang - Tithi, Muhurat and Festivals", "short_name": "Panchang", "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": "#FFFFFF", "theme_color": "#B71C1C", "lang": "en-IN", "icons": [{"src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png"}, {"src": "assets/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=2))
    core = ["./", "index.html", "calendar.html", "festivals.html", "about.html", "privacy.html", "assets/panchang.css", "assets/app.js", "assets/engine.js", "assets/moon.js", "assets/cities.js", "assets/regional.js", "muhurat.html", "rashi.html", "assets/events.json", "assets/icon.svg"]
    write("sw.js", '''// Network first so updates show at once; cached copy when offline.
var CACHE = "panchang-v5";
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
