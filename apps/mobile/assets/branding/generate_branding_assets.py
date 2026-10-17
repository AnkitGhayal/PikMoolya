import os
from PIL import Image, ImageDraw, ImageFont

# Directory paths
BRANDING_DIR = r"c:\Users\asus\OneDrive\Desktop\PikMoolya\apps\mobile\assets\branding"
ASSETS_DIR = r"c:\Users\asus\OneDrive\Desktop\PikMoolya\apps\mobile\assets"

os.makedirs(BRANDING_DIR, exist_ok=True)

# ---------------------------------------------------------
# 1. CREATE SVG FILES
# ---------------------------------------------------------

SVG_ICON = '''<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#F4FBF5"/>
  <rect x="8" y="8" width="496" height="496" rx="104" stroke="#2E7D32" stroke-width="4" stroke-opacity="0.12"/>
  <circle cx="256" cy="256" r="180" fill="url(#gold_grad)" opacity="0.12"/>
  
  <!-- Stylized P Leaf Stem -->
  <path d="M 180 370 V 160 C 180 148.954 188.954 140 200 140 H 250 C 294.183 140 330 175.817 330 220 C 330 264.183 294.183 300 250 300 H 224 V 370 C 224 381.046 215.046 390 204 390 H 200 C 188.954 390 180 381.046 180 370 Z" fill="url(#green_grad)"/>
  <path d="M 224 184 H 250 C 269.882 184 286 200.118 286 220 C 286 239.882 269.882 256 250 256 H 224 V 184 Z" fill="#FFFFFF"/>
  <path d="M 250 140 C 250 140 330 90 375 135 C 420 180 365 245 365 245 C 365 245 330 200 288 190 C 255 182 250 140 250 140 Z" fill="url(#fresh_leaf_grad)"/>
  <circle cx="250" cy="220" r="16" fill="url(#gold_grad)"/>
  
  <defs>
    <linearGradient id="green_grad" x1="180" y1="140" x2="330" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1B5E20"/>
      <stop offset="100%" stop-color="#2E7D32"/>
    </linearGradient>
    <linearGradient id="fresh_leaf_grad" x1="250" y1="90" x2="375" y2="245" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="gold_grad" x1="230" y1="200" x2="270" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
</svg>'''

SVG_LOGO_LIGHT = '''<svg width="440" height="110" viewBox="0 0 440 110" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(10, 10) scale(0.17578)">
    <rect width="512" height="512" rx="112" fill="#F4FBF5"/>
    <path d="M 180 370 V 160 C 180 148.954 188.954 140 200 140 H 250 C 294.183 140 330 175.817 330 220 C 330 264.183 294.183 300 250 300 H 224 V 370 C 224 381.046 215.046 390 204 390 H 200 C 188.954 390 180 381.046 180 370 Z" fill="url(#l_green_grad)"/>
    <path d="M 224 184 H 250 C 269.882 184 286 200.118 286 220 C 286 239.882 269.882 256 250 256 H 224 V 184 Z" fill="#FFFFFF"/>
    <path d="M 250 140 C 250 140 330 90 375 135 C 420 180 365 245 365 245 C 365 245 330 200 288 190 C 255 182 250 140 250 140 Z" fill="url(#l_leaf_grad)"/>
    <circle cx="250" cy="220" r="16" fill="url(#l_gold_grad)"/>
  </g>
  <text x="115" y="65" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="900" letter-spacing="-0.8">
    <tspan fill="#1B5E20">Pik</tspan><tspan fill="#1E293B">M</tspan><tspan fill="#1E293B">oolya</tspan>
  </text>
  <circle cx="174" cy="35" r="5" fill="#F59E0B"/>
  <path d="M 190 72 C 208 76 228 76 245 72" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
  <text x="116" y="87" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="#64748B" letter-spacing="1.5">FAIR PRICE • DIRECT MARKET</text>
  <defs>
    <linearGradient id="l_green_grad" x1="180" y1="140" x2="330" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1B5E20"/><stop offset="100%" stop-color="#2E7D32"/>
    </linearGradient>
    <linearGradient id="l_leaf_grad" x1="250" y1="90" x2="375" y2="245" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="l_gold_grad" x1="230" y1="200" x2="270" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
</svg>'''

SVG_LOGO_DARK = '''<svg width="440" height="110" viewBox="0 0 440 110" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(10, 10) scale(0.17578)">
    <rect width="512" height="512" rx="112" fill="#1E293B"/>
    <path d="M 180 370 V 160 C 180 148.954 188.954 140 200 140 H 250 C 294.183 140 330 175.817 330 220 C 330 264.183 294.183 300 250 300 H 224 V 370 C 224 381.046 215.046 390 204 390 H 200 C 188.954 390 180 381.046 180 370 Z" fill="url(#d_green_grad)"/>
    <path d="M 224 184 H 250 C 269.882 184 286 200.118 286 220 C 286 239.882 269.882 256 250 256 H 224 V 184 Z" fill="#1E293B"/>
    <path d="M 250 140 C 250 140 330 90 375 135 C 420 180 365 245 365 245 C 365 245 330 200 288 190 C 255 182 250 140 250 140 Z" fill="url(#d_leaf_grad)"/>
    <circle cx="250" cy="220" r="16" fill="url(#d_gold_grad)"/>
  </g>
  <text x="115" y="65" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="900" letter-spacing="-0.8">
    <tspan fill="#4ADE80">Pik</tspan><tspan fill="#FFFFFF">M</tspan><tspan fill="#FFFFFF">oolya</tspan>
  </text>
  <circle cx="174" cy="35" r="5" fill="#FBBF24"/>
  <path d="M 190 72 C 208 76 228 76 245 72" stroke="#FBBF24" stroke-width="3.5" stroke-linecap="round"/>
  <text x="116" y="87" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" letter-spacing="1.5">FAIR PRICE • DIRECT MARKET</text>
  <defs>
    <linearGradient id="d_green_grad" x1="180" y1="140" x2="330" y2="390" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2E7D32"/><stop offset="100%" stop-color="#4ADE80"/>
    </linearGradient>
    <linearGradient id="d_leaf_grad" x1="250" y1="90" x2="375" y2="245" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="d_gold_grad" x1="230" y1="200" x2="270" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
</svg>'''

with open(os.path.join(BRANDING_DIR, 'pikmoolya-icon.svg'), 'w', encoding='utf-8') as f:
    f.write(SVG_ICON)

with open(os.path.join(BRANDING_DIR, 'pikmoolya-logo.svg'), 'w', encoding='utf-8') as f:
    f.write(SVG_LOGO_LIGHT)

with open(os.path.join(BRANDING_DIR, 'pikmoolya-logo-dark.svg'), 'w', encoding='utf-8') as f:
    f.write(SVG_LOGO_DARK)

print("SVG assets created successfully!")

# ---------------------------------------------------------
# 2. CREATE HIGH-RES PNG ASSETS VIA PIL DRAWING
# ---------------------------------------------------------

def create_icon_png(size=512, bg_color=None):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = size / 512.0

    if bg_color:
        draw.rounded_rectangle([0, 0, size, size], radius=int(112 * scale), fill=bg_color)
    else:
        # Transparent with soft rounded container
        draw.rounded_rectangle([0, 0, size, size], radius=int(112 * scale), fill=(244, 251, 245, 255))
        draw.rounded_rectangle([int(8*scale), int(8*scale), int(504*scale), int(504*scale)], radius=int(104*scale), outline=(46, 125, 50, 30), width=int(4*scale))

    # Draw outer glow circle
    cx, cy, cr = int(256 * scale), int(256 * scale), int(180 * scale)
    draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(245, 158, 11, 25))

    # P stem shape
    # Pillar
    draw.rounded_rectangle([int(180*scale), int(140*scale), int(224*scale), int(390*scale)], radius=int(18*scale), fill=(27, 94, 32, 255))
    # Loop
    draw.ellipse([int(180*scale), int(140*scale), int(330*scale), int(300*scale)], fill=(46, 125, 50, 255))
    inner_bg = bg_color if bg_color else (255, 255, 255, 255)
    draw.ellipse([int(224*scale), int(184*scale), int(286*scale), int(256*scale)], fill=inner_bg)
    draw.rectangle([int(180*scale), int(256*scale), int(224*scale), int(390*scale)], fill=(27, 94, 32, 255))

    # Sprouting Leaf (polygon/ellipse overlay)
    draw.polygon([
        (int(250*scale), int(140*scale)),
        (int(330*scale), int(90*scale)),
        (int(375*scale), int(135*scale)),
        (int(365*scale), int(245*scale)),
        (int(288*scale), int(190*scale)),
    ], fill=(5, 150, 105, 255))

    # Golden coin/seed inside
    gcx, gcy, gcr = int(250 * scale), int(220 * scale), int(18 * scale)
    draw.ellipse([gcx - gcr, gcy - gcr, gcx + gcr, gcy + gcr], fill=(245, 158, 11, 255))
    draw.ellipse([gcx - int(8*scale), gcy - int(8*scale), gcx + int(8*scale), gcy + int(8*scale)], fill=(251, 191, 36, 255))

    return img

def create_logo_png(width=880, height=220, dark_mode=False):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = height / 110.0

    # Draw Brand Icon on left
    icon_img = create_icon_png(size=int(90 * scale), bg_color=(30, 41, 59, 255) if dark_mode else (244, 251, 245, 255))
    img.paste(icon_img, (int(10 * scale), int(10 * scale)), icon_img)

    # Load system font
    try:
        font_path = "C:\\Windows\\Fonts\\arialbd.ttf"
        font_large = ImageFont.truetype(font_path, int(44 * scale))
        font_sub = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", int(10 * scale))
    except:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Colors
    c_pik = (74, 222, 128, 255) if dark_mode else (27, 94, 32, 255)
    c_moolya = (255, 255, 255, 255) if dark_mode else (30, 41, 59, 255)
    c_sub = (148, 163, 184, 255) if dark_mode else (100, 116, 139, 255)
    c_gold = (251, 191, 36, 255) if dark_mode else (245, 158, 11, 255)

    tx = int(115 * scale)
    ty = int(22 * scale)

    draw.text((tx, ty), "Pik", font=font_large, fill=c_pik)
    pik_bbox = font_large.getbbox("Pik")
    pik_w = pik_bbox[2] - pik_bbox[0]

    draw.text((tx + pik_w, ty), "Moolya", font=font_large, fill=c_moolya)

    # Golden dot on 'i' in Pik
    dot_x = tx + int(58 * scale)
    dot_y = ty + int(10 * scale)
    draw.ellipse([dot_x - int(5*scale), dot_y - int(5*scale), dot_x + int(5*scale), dot_y + int(5*scale)], fill=c_gold)

    # Golden curve under Moolya
    m_x = tx + pik_w
    draw.arc([m_x, ty + int(45*scale), m_x + int(60*scale), ty + int(55*scale)], start=20, end=160, fill=c_gold, width=int(3*scale))

    # Subtitle text
    draw.text((tx + int(2*scale), ty + int(52*scale)), "FAIR PRICE • DIRECT MARKET", font=font_sub, fill=c_sub)

    return img

# Save PNGs in branding directory
icon_512 = create_icon_png(512)
icon_512.save(os.path.join(BRANDING_DIR, 'pikmoolya-icon.png'))

logo_light = create_logo_png(880, 220, dark_mode=False)
logo_light.save(os.path.join(BRANDING_DIR, 'pikmoolya-logo.png'))

logo_dark = create_logo_png(880, 220, dark_mode=True)
logo_dark.save(os.path.join(BRANDING_DIR, 'pikmoolya-logo-dark.png'))

# Save app root PNG assets
logo_header = logo_light.resize((440, 110), Image.Resampling.LANCZOS)
logo_header.save(os.path.join(ASSETS_DIR, 'logo-header.png'))

logo_main = logo_light.resize((660, 165), Image.Resampling.LANCZOS)
logo_main.save(os.path.join(ASSETS_DIR, 'logo-main.png'))

icon_app = create_icon_png(512, bg_color=(244, 251, 245, 255))
icon_app.save(os.path.join(ASSETS_DIR, 'icon.png'))

splash_app = create_icon_png(512, bg_color=(244, 251, 245, 255))
splash_app.save(os.path.join(ASSETS_DIR, 'splash-icon.png'))

android_fg = create_icon_png(432, bg_color=None)
android_fg.save(os.path.join(ASSETS_DIR, 'android-icon-foreground.png'))

favicon = create_icon_png(48, bg_color=(244, 251, 245, 255))
favicon.save(os.path.join(ASSETS_DIR, 'favicon.png'))

print("All high-res PNG assets generated successfully!")
