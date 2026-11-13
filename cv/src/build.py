"""Builds the CV HTML in English and Spanish from one template. PDFs are printed from these pages."""
import html, pathlib

CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { width: 210mm; min-height: 297mm; padding: 10mm 14mm 8mm; background: #fff; color: #141a26;
  font: 400 8.3pt/1.38 "Manrope", system-ui, sans-serif; }
a { color: inherit; text-decoration: none; }
header { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: end; padding-bottom: 3.6mm; border-bottom: 1.4pt solid #0b1220; }
h1 { font: 700 23pt/1 "Archivo", sans-serif; font-stretch: 118%; letter-spacing: -.02em; text-transform: uppercase; }
.role { margin-top: 2.2mm; font: 500 8pt "DM Mono", monospace; letter-spacing: .18em; text-transform: uppercase; color: #0a6f8f; }
.contact { display: grid; gap: .6mm; justify-items: end; font: 400 7.6pt/1.5 "DM Mono", monospace; color: #3a4558; }
.contact b { font-weight: 500; color: #141a26; }
section { margin-top: 3.4mm; }
h2 { display: flex; align-items: center; gap: 3mm; margin-bottom: 1.7mm; font: 500 7.2pt "DM Mono", monospace; letter-spacing: .22em; text-transform: uppercase; color: #0a6f8f; }
h2::after { content: ""; flex: 1; height: .5pt; background: #c9d2df; }
.summary { font-size: 8.8pt; line-height: 1.42; color: #232c3b; }
.item + .item { margin-top: 2.2mm; }
.item__top { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
h3 { font: 700 9.4pt "Archivo", sans-serif; font-stretch: 110%; letter-spacing: -.005em; }
h3 span { font: 500 8.1pt "Manrope", sans-serif; color: #3a4558; }
.when { font: 400 7.4pt "DM Mono", monospace; letter-spacing: .06em; color: #566176; white-space: nowrap; }
ul { margin: 1.2mm 0 0 3.6mm; }
li { padding-left: 1mm; margin-top: .5mm; color: #2a3342; }
li::marker { color: #0a6f8f; }
.stack { margin-top: 1.2mm; font: 400 7.5pt "DM Mono", monospace; color: #566176; }
.grid { display: grid; grid-template-columns: 34mm 1fr; gap: 1.1mm 4mm; }
.grid dt { font: 500 7.2pt/1.9 "DM Mono", monospace; letter-spacing: .1em; text-transform: uppercase; color: #566176; }
.cols { display: grid; grid-template-columns: 1.25fr 1fr; gap: 8mm; }
"""

DATA = {
 "en": dict(
  file="cv-en.html", lang="en", role="Computer Engineer",
  place="Brunete, Madrid, Spain", portfolio="Portfolio",
  h=dict(profile="Profile", exp="Experience", proj="Projects", edu="Education", skills="Skills", lang="Languages", other="Other"),
  summary="Computer Engineer based in Madrid, working as a Calypso developer in capital markets and heading for the space sector. "
          "I built SKYFALL, an open-source tool that maps where re-entering space debris is likely to fall, and a spacecraft descent "
          "and landing simulator as my final degree project.",
  exp=[dict(t="Calypso Developer", s="Qaracter · job title: Financial Analyst", w="Jan 2025 – Present · Madrid", b=[
        "Develop and maintain trade confirmations for FX products on the Calypso platform.",
        "Generate the confirmation documents with the specific data each product requires.",
        "Manage delivery across confirmation channels: email, fax, TradeServ and SWIFT."],
        k="Calypso · Java · Oracle SQL")],
  proj=[dict(t="SKYFALL", s="Re-entry risk maps for space debris · open source (MIT)", w="2026", b=[
        "Turns official re-entry warnings (TIP messages from Space-Track) into 90, 95 and 99 % probability zones on a 3D globe, and compares them with the airspace closure strips from the EASA bulletins.",
        "Samples re-entry times from the measured error of a year of past warnings (about 4,450 warnings, 680 objects), propagates each orbit with SGP4 and scatters debris with Monte Carlo runs on a 0.5° grid.",
        "Validated on 100 real warnings the model had never seen: the 95 % zone contained 95 confirmed impact points, against 87 for the 120 km strip, for about the same closed area."],
        k="Python · FastAPI · pytest · React · TypeScript · CesiumJS · developed with Claude Code"),
        dict(t="Spacecraft Descent and Landing Simulator", s="Final degree project · solo · graded 8.9 / 10", w="2024", b=[
        "Simulates descent and landing on the Moon, Mars and a configurable planet: gravity, wind, thrust, fuel burn that lightens the vehicle, hull heating, heat shield and parachute.",
        "Mission parameters are set before each run; vehicle models are streamed at runtime from Microsoft Azure Blob Storage with private access keys, with a local fallback."],
        k="C# · Unity · Azure Blob Storage · REST"),
        dict(t="Love Engine", s="Custom 3D engine in C++ · team project", w="University", b=[
        "Engine built on Ogre3D (rendering), Bullet (physics), FMOD (audio) and Lua scripting, with a complete 3D title developed on top of it."],
        k="C++ · Lua · Ogre3D · Bullet · FMOD")],
  edu=[dict(t="BSc in Video Game Development", s="Universidad Complutense de Madrid", w="2019 – 2024", b=[
        "Programming in C++ and C#, physics simulation, artificial intelligence and machine learning, networking, and team projects run with Scrum and QA."])],
  skills=[("Languages", "Python, C#, C++, C, Java, TypeScript, JavaScript, SQL"),
          ("Space & simulation", "SGP4 orbit propagation, Monte Carlo methods, rigid-body physics, Unity, CesiumJS"),
          ("Backend & cloud", "FastAPI, REST APIs, Microsoft Azure, Oracle SQL, SQLite"),
          ("Financial systems", "Calypso, FX trade confirmations, SWIFT"),
          ("Tools & practice", "Git, pytest, unit testing, Visual Studio, VS Code, Jupyter, Scrum")],
  langs=[("Spanish", "Native"), ("English", "B2 · Cambridge First Certificate")],
  other=[("Driving licence", "B")]),
 "es": dict(
  file="cv-es.html", lang="es", role="Ingeniero informático",
  place="Brunete, Madrid, España", portfolio="Portfolio",
  h=dict(profile="Perfil", exp="Experiencia", proj="Proyectos", edu="Formación", skills="Competencias", lang="Idiomas", other="Otros"),
  summary="Ingeniero informático en Madrid. Trabajo como desarrollador Calypso en mercados de capitales y oriento mi carrera hacia el sector espacial. "
          "He creado SKYFALL, una herramienta de código abierto que calcula dónde es probable que caiga la basura espacial en su reentrada, "
          "y un simulador de descenso y aterrizaje de naves espaciales como trabajo de fin de grado.",
  exp=[dict(t="Desarrollador Calypso", s="Qaracter · puesto: Analista financiero", w="Ene 2025 – Actualidad · Madrid", b=[
        "Desarrollo y mantenimiento de confirmaciones de operaciones de productos FX en la plataforma Calypso.",
        "Generación de los documentos de confirmación con la información específica de cada producto.",
        "Gestión del envío por las distintas vías de confirmación: email, fax, TradeServ y SWIFT."],
        k="Calypso · Java · Oracle SQL")],
  proj=[dict(t="SKYFALL", s="Mapas de riesgo de reentrada de basura espacial · código abierto (MIT)", w="2026", b=[
        "Convierte los avisos oficiales de reentrada (mensajes TIP de Space-Track) en zonas de probabilidad del 90, 95 y 99 % sobre un globo 3D y las compara con las franjas de cierre de espacio aéreo de los boletines de EASA.",
        "Muestrea la hora de reentrada a partir del error medido en un año de avisos anteriores (unos 4.450 avisos, 680 objetos), propaga cada órbita con SGP4 y dispersa los fragmentos con simulaciones de Monte Carlo en una rejilla de 0,5°.",
        "Validado con 100 avisos reales que el modelo no había visto: la zona del 95 % contuvo 95 puntos de impacto confirmados, frente a 87 de la franja de 120 km, con un área cerrada similar."],
        k="Python · FastAPI · pytest · React · TypeScript · CesiumJS · desarrollado con Claude Code"),
        dict(t="Simulador de descenso y aterrizaje de naves espaciales", s="Trabajo de fin de grado · individual · nota 8,9 / 10", w="2024", b=[
        "Simula el descenso y aterrizaje en la Luna, Marte y un planeta configurable: gravedad, viento, empuje, consumo de combustible que aligera la nave, calentamiento del casco, escudo térmico y paracaídas.",
        "Los parámetros de la misión se ajustan antes de cada simulación; los modelos de las naves se descargan en tiempo de ejecución desde Microsoft Azure Blob Storage con claves de acceso privadas, con alternativa en local."],
        k="C# · Unity · Azure Blob Storage · REST"),
        dict(t="Love Engine", s="Motor 3D propio en C++ · proyecto en equipo", w="Universidad", b=[
        "Motor construido sobre Ogre3D (renderizado), Bullet (físicas), FMOD (audio) y scripting en Lua, con un título 3D completo desarrollado sobre él."],
        k="C++ · Lua · Ogre3D · Bullet · FMOD")],
  edu=[dict(t="Grado en Desarrollo de Videojuegos", s="Universidad Complutense de Madrid", w="2019 – 2024", b=[
        "Programación en C++ y C#, simulación física, inteligencia artificial y aprendizaje automático, redes, y proyectos en equipo con Scrum y QA."])],
  skills=[("Lenguajes", "Python, C#, C++, C, Java, TypeScript, JavaScript, SQL"),
          ("Espacio y simulación", "Propagación orbital SGP4, métodos de Monte Carlo, física de sólido rígido, Unity, CesiumJS"),
          ("Backend y nube", "FastAPI, API REST, Microsoft Azure, Oracle SQL, SQLite"),
          ("Sistemas financieros", "Calypso, confirmaciones de operaciones FX, SWIFT"),
          ("Herramientas", "Git, pytest, pruebas unitarias, Visual Studio, VS Code, Jupyter, Scrum")],
  langs=[("Español", "Nativo"), ("Inglés", "B2 · First Certificate de Cambridge")],
  other=[("Carnet de conducir", "B")]),
}

e = html.escape
def items(rows):
    out = []
    for r in rows:
        out.append('<div class="item"><div class="item__top"><h3>%s <span>· %s</span></h3><span class="when">%s</span></div><ul>%s</ul>%s</div>' % (
            e(r["t"]), e(r["s"]), e(r["w"]), "".join("<li>%s</li>" % e(b) for b in r["b"]),
            '<p class="stack">%s</p>' % e(r["k"]) if r.get("k") else ""))
    return "".join(out)
def dl(rows): return '<dl class="grid">%s</dl>' % "".join("<dt>%s</dt><dd>%s</dd>" % (e(a), e(b)) for a, b in rows)

here = pathlib.Path(__file__).parent
for d in DATA.values():
    h = d["h"]
    page = f"""<!DOCTYPE html><html lang="{d['lang']}"><head><meta charset="utf-8"><title>Daniel Ruiz Figueroa · CV</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<header><div><h1>Daniel Ruiz Figueroa</h1><p class="role">{e(d['role'])}</p></div>
<div class="contact"><span>{e(d['place'])}</span><span>+34 620 64 83 05</span><a href="mailto:daniel.ruiz.figueroa01@gmail.com">daniel.ruiz.figueroa01@gmail.com</a>
<a href="https://druiz07.github.io/Druiz07/"><b>{e(d['portfolio'])}:</b> druiz07.github.io/Druiz07</a>
<a href="https://www.linkedin.com/in/daniel-ruiz-figueroa-developer/"><b>LinkedIn:</b> in/daniel-ruiz-figueroa-developer</a>
<a href="https://github.com/Druiz07"><b>GitHub:</b> github.com/Druiz07</a></div></header>
<section><h2>{h['profile']}</h2><p class="summary">{e(d['summary'])}</p></section>
<section><h2>{h['exp']}</h2>{items(d['exp'])}</section>
<section><h2>{h['proj']}</h2>{items(d['proj'])}</section>
<section><h2>{h['edu']}</h2>{items(d['edu'])}</section>
<section><h2>{h['skills']}</h2>{dl(d['skills'])}</section>
<section class="cols"><div><h2>{h['lang']}</h2>{dl(d['langs'])}</div><div><h2>{h['other']}</h2>{dl(d['other'])}</div></section>
</body></html>"""
    (here / d["file"]).write_text(page, encoding="utf-8")
print("ok")
