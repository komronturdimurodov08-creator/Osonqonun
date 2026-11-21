import sys, time
from playwright.sync_api import sync_playwright
url = "file:///home/claude/osonqonun/dist/index.html"
out = "/home/claude/shots/"
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--autoplay-policy=no-user-gesture-required"])
    def page(w, h):
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.on("console", lambda m: m.type in ("error",) and errs.append(m.text))
        pg.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
        pg.route("**/fonts.googleapis.com/**", lambda r: r.abort())
        pg.route("**/fonts.gstatic.com/**", lambda r: r.abort())
        return pg
    pg = page(1280, 900)
    pg.goto(url, wait_until="domcontentloaded"); time.sleep(0.8)
    pg.screenshot(path=out + "01-home.png")
    pg.click(".hero-player .poster"); time.sleep(4.5)
    pg.screenshot(path=out + "02-playing.png")
    pg.click(".hero-player button[aria-label='Keyingi sahna']"); pg.click(".hero-player button[aria-label='Keyingi sahna']"); time.sleep(2.5)
    pg.screenshot(path=out + "03-scene-article.png")
    pg.click(".hero-player button[aria-label='Keyingi sahna']"); pg.click(".hero-player button[aria-label='Keyingi sahna']"); pg.click(".hero-player button[aria-label='Keyingi sahna']"); time.sleep(5)
    pg.locator(".hero-player .stage").screenshot(path=out + "04-steps.png")
    # vertical
    pg.click(".hero-player button[title='Vertikal 9:16']"); time.sleep(1.5)
    pg.locator(".hero-player .player").screenshot(path=out + "05-vertical.png")
    # cases
    pg.goto(url + "#learn"); time.sleep(0.6)
    pg.screenshot(path=out + "06-cases.png")
    pg.click(".case-card >> nth=0"); time.sleep(0.5)
    pg.click(".poster"); time.sleep(1)
    for i in range(3): pg.click("button[aria-label='Keyingi sahna']"); time.sleep(0.3)
    time.sleep(1.5)
    pg.screenshot(path=out + "07-case-stop.png")
    pg.click(".stop-card >> text=Yechimni ko'rsat"); time.sleep(2)
    pg.screenshot(path=out + "08-case-solution.png", full_page=True)
    # lessons
    pg.goto(url + "#lessons"); time.sleep(0.6)
    pg.click(".quiz-q >> nth=0 >> .opt >> nth=0"); time.sleep(0.3)
    pg.screenshot(path=out + "09-lessons.png", full_page=True)
    # make page offline generator
    pg.goto(url + "#make"); time.sleep(0.5)
    pg.fill("textarea", "Xodimga 4 oy sinov muddati belgilanadi. Ta%s til 15 kun." % chr(39)); pg.click("text=Multfilm yaratish"); time.sleep(1.5)
    pg.screenshot(path=out + "10-make.png", full_page=True)
    # roadmap
    pg.goto(url + "#roadmap"); time.sleep(0.5)
    pg.click(".tl-card >> nth=3 >> text=1 daqiqalik multfilm"); time.sleep(0.8)
    pg.screenshot(path=out + "11-roadmap.png", full_page=True)
    # profile + cyrillic
    pg.goto(url + "#profile"); time.sleep(0.4)
    pg.click("text=УЗБ · Ўзбекча"); time.sleep(0.5)
    pg.screenshot(path=out + "12-profile-cyr.png", full_page=True)
    # mobile
    m = page(390, 844)
    m.goto(url, wait_until="domcontentloaded"); time.sleep(0.6)
    m.click(".poster"); time.sleep(5)
    m.screenshot(path=out + "13-mobile.png", full_page=True)
    b.close()
print("ERRORS:", errs if errs else "none")
