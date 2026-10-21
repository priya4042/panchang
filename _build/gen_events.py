# Finds every tithi, nakshatra, yoga, karana and sankranti change from 2025 to 2030 and writes assets/events.json.
# Times are minutes since 2025-01-01 00:00 UTC. Values only ever step forward by one, so each list stores the
# starting value plus the change times (delta-encoded).
import json, math, os, sys, time as T
import astronomy as A

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
START = A.Time.Make(2025, 1, 1, 0, 0, 0)
END_DAYS = (A.Time.Make(2031, 1, 1, 0, 0, 0).ut - START.ut)

def ayanamsa(t):
    # Lahiri (Chitrapaksha) with precession; +35" calibrated so sankranti moments match Drik Panchang 2026
    T_ = t.tt / 36525.0
    return 23.86275 + (5028.796195 * T_ + 1.1054348 * T_ * T_) / 3600.0

def moon(t): return A.EclipticGeoMoon(t).lon
def sun(t): return A.SunPosition(t).elon

def tithi(t): return int(((moon(t) - sun(t)) % 360) // 12)                    # 0..29
def karana(t): return int(((moon(t) - sun(t)) % 360) // 6)                    # 0..59
def nak(t): return int(((moon(t) - ayanamsa(t)) % 360) // (360 / 27))         # 0..26
def yoga(t): return int(((moon(t) + sun(t) - 2 * ayanamsa(t)) % 360) // (360 / 27))
def rashi_sun(t): return int(((sun(t) - ayanamsa(t)) % 360) // 30)            # 0..11
def rashi_moon(t): return int(((moon(t) - ayanamsa(t)) % 360) // 30)

def at(d): return START.AddDays(d)

def changes(fn, step_days, n):
    """Start value plus the times (days since START) where fn steps up."""
    out, d = [], 0.0
    v0 = fn(at(0)); v = v0
    while d < END_DAYS:
        d2 = min(d + step_days, END_DAYS)
        v2 = fn(at(d2))
        if v2 != v:
            lo, hi = d, d2
            while (hi - lo) * 86400 > 1:                       # bisect to one second
                mid = (lo + hi) / 2
                if fn(at(mid)) == v: lo = mid
                else: hi = mid
            out.append(hi)
            v = (v + 1) % n
            assert v == v2 or step_days > 0.2, (fn.__name__, d, v, v2)  # never two steps in one window
        d = d2
    return v0, out

def pack(v0, times):
    mins = [round(x * 1440) for x in times]
    deltas = [mins[0]] + [b - a for a, b in zip(mins, mins[1:])]
    return {"v0": v0, "d": deltas}

if __name__ == "__main__":
    t0 = T.time(); res = {"epoch": "2025-01-01T00:00:00Z", "ayanamsa": "Lahiri"}
    for name, fn, step, n in [("tithi", tithi, 0.1, 30), ("karana", karana, 0.05, 60), ("nakshatra", nak, 0.1, 27), ("yoga", yoga, 0.1, 27),
                              ("sunrashi", rashi_sun, 1.0, 12), ("moonrashi", rashi_moon, 0.25, 12)]:
        v0, times = changes(fn, step, n); res[name] = pack(v0, times)
        print(name, v0, len(times), round(T.time() - t0, 1), "s", flush=True)
    json.dump(res, open(os.path.join(R, "assets", "events.json"), "w"), separators=(",", ":"))
    print("bytes", os.path.getsize(os.path.join(R, "assets", "events.json")))
