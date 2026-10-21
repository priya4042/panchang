# Icons and share card, drawn with Pillow.
import os
from PIL import Image, ImageDraw, ImageFont
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A = os.path.join(R, "assets")
RED, HALDI, BG = (183, 28, 28), (232, 163, 23), (255, 255, 255)
def mark(size, pad, bg):
    S = size * 4; im = Image.new("RGBA", (S, S), bg); d = ImageDraw.Draw(im); k = S * (1 - 2 * pad) / 34; o = S * pad
    P = lambda x, y: (o + x * k, o + y * k)
    d.pieslice((*P(8, 15), *P(26, 33)), 180, 360, fill=HALDI)
    for a, b in [((17, 8), (17, 11)), ((8.5, 11.5), (10.5, 13.5)), ((25.5, 11.5), (23.5, 13.5)), ((4.5, 19), (7, 19)), ((27, 19), (29.5, 19))]:
        d.line([P(*a), P(*b)], fill=HALDI, width=int(2.2 * k))
    d.line([P(3, 24), P(31, 24)], fill=RED, width=int(2.4 * k))
    d.ellipse((*P(15, 27), *P(19, 31)), fill=RED)
    return im.resize((size, size), Image.LANCZOS)
mark(192, .06, (*BG, 255)).save(os.path.join(A, "icon-192.png"))
mark(512, .06, (*BG, 255)).save(os.path.join(A, "icon-512.png"))
mark(512, .18, (*BG, 255)).save(os.path.join(A, "icon-maskable.png"))
W, H = 1200, 630; im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
d.rectangle((0, 0, W, 14), fill=RED); d.rectangle((0, 20, W, 24), fill=RED)
F = lambda n, s: ImageFont.truetype(os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", n), s)
m = mark(220, 0, (0, 0, 0, 0)); im.paste(m, (900, 90), m)
d.text((80, 110), "Panchang", font=F("georgia.ttf", 110), fill=RED)
d.text((80, 270), "Tithi, nakshatra, Rahu Kaal", font=F("segoeuib.ttf", 52), fill=(42, 26, 18))
d.text((80, 340), "and every festival, for your city", font=F("segoeuib.ttf", 52), fill=(42, 26, 18))
d.text((80, 460), "English and Hindi. Free. Works offline.", font=F("segoeui.ttf", 38), fill=(110, 90, 78))
d.rectangle((0, H - 24, W, H - 20), fill=RED); d.rectangle((0, H - 14, W, H), fill=RED)
im.save(os.path.join(A, "og.png"), optimize=True); print("icons ok")
