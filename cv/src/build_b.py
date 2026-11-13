"""Layout B: dark header band, main column plus sidebar. Reuses the content in build.py."""
import html, pathlib
from build import DATA
e = html.escape
CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { width: 210mm; height: 297mm; background: #fff; color: #141a26; font: 400 8.4pt/1.42 "Manrope", system-ui, sans-serif; display: grid; grid-template-rows: auto 1fr; overflow: hidden; }
a { color: inherit; text-decoration: none; }
header { background: #070b14; color: #e9eef7; padding: 11mm 14mm 8mm; display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: center;
  background-image: radial-gradient(70mm 40mm at 100% 0, rgba(60,110,200,.45), transparent 70%); }
h1 { font: 700 25pt/1 "Archivo", sans-serif; font-stretch: 118%; letter-spacing: -.02em; text-transform: uppercase; }
.role { margin-top: 2.6mm; font: 500 8.2pt "DM Mono", monospace; letter-spacing: .2em; text-transform: uppercase; color: #7fe3ff; }
.contact { display: grid; grid-template-columns: auto auto; gap: .9mm 5mm; font: 400 7.5pt/1.5 "DM Mono", monospace; color: #c3cee0; }
.contact i { font-style: normal; color: #7fe3ff; letter-spacing: .1em; text-transform: uppercase; font-size: 6.6pt; }
.wrap { display: grid; grid-template-columns: 1fr 58mm; }
main { padding: 6.5mm 8mm 8mm 14mm; }
aside { padding: 6.5mm 12mm 8mm 8mm; background: #f1f4f9; border-left: .5pt solid #d3dbe7; }
section + section { margin-top: 5mm; }
h2 { margin-bottom: 2.4mm; padding-bottom: 1.4mm; border-bottom: .8pt solid #0b1220; font: 500 7.4pt "DM Mono", monospace; letter-spacing: .22em; text-transform: uppercase; color: #0a6f8f; }
.summary { font-size: 9.1pt; line-height: 1.5; color: #232c3b; }
.item + .item { margin-top: 3.6mm; }
.item__top { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
h3 { font: 700 10pt/1.2 "Archivo", sans-serif; font-stretch: 110%; }
.sub { margin-top: .5mm; font-weight: 500; color: #3a4558; }
.when { font: 400 7.3pt "DM Mono", monospace; color: #566176; white-space: nowrap; }
ul { margin: 1.3mm 0 0 3.4mm; }
li { padding-left: .8mm; margin-top: .7mm; color: #2a3342; }
li::marker { color: #0a6f8f; }
.stack { margin-top: 1.5mm; display: flex; flex-wrap: wrap; gap: 1mm; }
.stack span { padding: .4mm 1.6mm; border: .5pt solid #b9c5d6; border-radius: 1mm; font: 400 6.9pt "DM Mono", monospace; color: #3a4558; }
aside h3 { font: 500 6.9pt "DM Mono", monospace; letter-spacing: .12em; text-transform: uppercase; color: #566176; margin-bottom: .8mm; }
aside .g + .g { margin-top: 2.8mm; }
aside p { color: #232c3b; }
aside b { font: 700 9pt/1.25 "Archivo", sans-serif; font-stretch: 108%; display: block; }
"""
def items(rows):
    out = []
    for r in rows:
        tags = "".join("<span>%s</span>" % e(t.strip()) for t in r["k"].split("·")) if r.get("k") else ""
        out.append('<div class="item"><div class="item__top"><h3>%s</h3><span class="when">%s</span></div><p class="sub">%s</p><ul>%s</ul>%s</div>' % (
            e(r["t"]), e(r["w"]), e(r["s"]), "".join("<li>%s</li>" % e(b) for b in r["b"]), '<div class="stack">%s</div>' % tags if tags else ""))
    return "".join(out)
def groups(rows): return "".join('<div class="g"><h3>%s</h3><p>%s</p></div>' % (e(a), e(b)) for a, b in rows)
here = pathlib.Path(__file__).parent
for d in DATA.values():
    h = d["h"]; ed = d["edu"][0]
    page = f"""<!DOCTYPE html><html lang="{d['lang']}"><head><meta charset="utf-8"><title>Daniel Ruiz Figueroa · CV</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<header><div><h1>Daniel Ruiz<br>Figueroa</h1><p class="role">{e(d['role'])}</p></div>
<div class="contact"><i>Web</i><a href="https://druiz07.github.io/Druiz07/">druiz07.github.io/Druiz07</a>
<i>Email</i><a href="mailto:daniel.ruiz.figueroa01@gmail.com">daniel.ruiz.figueroa01@gmail.com</a>
<i>Tel</i><span>+34 620 64 83 05</span>
<i>LinkedIn</i><a href="https://www.linkedin.com/in/daniel-ruiz-figueroa-developer/">in/daniel-ruiz-figueroa-developer</a>
<i>GitHub</i><a href="https://github.com/Druiz07">github.com/Druiz07</a>
<i>Base</i><span>{e(d['place'])}</span></div></header>
<div class="wrap"><main>
<section><h2>{h['profile']}</h2><p class="summary">{e(d['summary'])}</p></section>
<section><h2>{h['exp']}</h2>{items(d['exp'])}</section>
<section><h2>{h['proj']}</h2>{items(d['proj'])}</section>
</main><aside>
<section><h2>{h['skills']}</h2>{groups(d['skills'])}</section>
<section><h2>{h['edu']}</h2><div class="g"><b>{e(ed['t'])}</b><p>{e(ed['s'])}</p><p class="when">{e(ed['w'])}</p></div><div class="g"><p>{e(ed['b'][0])}</p></div></section>
<section><h2>{h['lang']}</h2>{groups(d['langs'])}</section>
<section><h2>{h['other']}</h2>{groups(d['other'])}</section>
</aside></div></body></html>"""
    (here / d["file"].replace(".html", "-b.html")).write_text(page, encoding="utf-8")
print("ok b")
