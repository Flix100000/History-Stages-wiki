from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (26, 19, 20)          # near-black with the icon's brick-red tint
GOLD = (224, 165, 62)
GOLD_DIM = (140, 100, 38)
TEXT = (245, 240, 233)
MUTED = (166, 155, 143)

card = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(card, "RGBA")

# radial-ish glow behind the icon, painted as concentric translucent ellipses
cx, cy = 300, H // 2 - 20
for r in range(360, 0, -12):
    a = int(16 * (1 - r / 360) ** 2 * 8)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(184, 121, 31, max(a, 1)))

# corner brackets, same motif as the site hero
def bracket(x, y, dx, dy, span=86, inset=44, w=4):
    d.line([(x + dx * inset, y + dy * (inset + span)), (x + dx * inset, y + dy * (inset + 18))], fill=GOLD, width=w)
    d.line([(x + dx * (inset + 18), y + dy * inset), (x + dx * (inset + span), y + dy * inset)], fill=GOLD, width=w)
    off = 26
    d.line([(x + dx * (inset + off), y + dy * (inset + off + span // 2)),
            (x + dx * (inset + off), y + dy * (inset + off + 16))], fill=GOLD_DIM, width=2)
    d.line([(x + dx * (inset + off + 16), y + dy * (inset + off)),
            (x + dx * (inset + off + span // 2), y + dy * (inset + off))], fill=GOLD_DIM, width=2)

bracket(0, 0, 1, 1)
bracket(W, 0, -1, 1)
bracket(0, H, 1, -1)
bracket(W, H, -1, -1)

# pixel art: nearest-neighbour at 1:1, anything else smears the padlock
icon = Image.open("static/img/icon.png").convert("RGBA")
card.paste(icon, (cx - 128, cy - 128), icon)

title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 82)
sub = ImageFont.truetype("C:/Windows/Fonts/seguisb.ttf", 36)
small = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 28)

tx = 540
d.text((tx, 208), "History Stages", font=title, fill=TEXT)
d.line([(tx, 316), (tx + 120, 316)], fill=GOLD, width=4)
d.text((tx, 348), "Documentation for modpack authors", font=sub, fill=GOLD)
d.text((tx, 404), "Stages, locks, research and the in-game editor —", font=small, fill=MUTED)
d.text((tx, 440), "the full reference for every version.", font=small, fill=MUTED)

card.save("static/img/social-card.png", optimize=True)
print("written", card.size)
