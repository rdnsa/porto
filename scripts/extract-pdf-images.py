"""Pull the screenshots and photos used by the site out of porto.pdf into media-src/pdf/.

Image xrefs are specific to the current porto.pdf; if the deck is re-exported, list them again with
`python3 -c "import fitz; [print(p.number + 1, p.get_images()) for p in fitz.open('porto.pdf')]"`.
"""
import pathlib

import fitz

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "media-src" / "pdf"

IMAGES = {
    553: "itb-event",
    617: "ifc-home",
    78: "ifc-news-stream",
    73: "ifc-search-console",
    74: "ifc-sprint-board",
    75: "ifc-team",
    129: "satglow-dashboard",
    181: "nose-one-dashboard",
    603: "genius-ai-devices",
    163: "nordpartners-home",
    759: "aix-home",
}

OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(ROOT / "porto.pdf")
for xref, name in IMAGES.items():
    image = doc.extract_image(xref)
    path = OUT / f"{name}.{image['ext']}"
    path.write_bytes(image["image"])
    print(f"{path.relative_to(ROOT)}  {image['width']}x{image['height']}")
