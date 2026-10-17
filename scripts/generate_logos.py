import os
from PIL import Image, ImageDraw, ImageFont

assets_dir = r"c:\Users\asus\OneDrive\Desktop\PikMoolya\apps\mobile\assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. App Icon (1024x1024)
def create_app_icon():
    size = (1024, 1024)
    img = Image.new("RGBA", size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Rounded background container (#2E7D32)
    bg_color = (46, 125, 50, 255)
    margin = 40
    draw.rounded_rectangle([margin, margin, 1024 - margin, 1024 - margin], radius=220, fill=bg_color)

    # Inner Gold Accent Circle (#F59E0B)
    draw.ellipse([260, 260, 764, 764], outline=(245, 158, 11, 200), width=18)

    # Stylized Agriculture Leaf (Left Curve)
    leaf_color = (255, 255, 255, 255)
    # Drawing leaf polygon and smooth arcs
    draw.polygon([(512, 300), (360, 480), (420, 680), (512, 740), (604, 680), (664, 480)], fill=leaf_color)
    # Inner cutout for leaf vein & market growth arrow (#2E7D32)
    draw.polygon([(512, 340), (460, 480), (512, 660), (564, 480)], fill=bg_color)
    
    # Currency / Fair Price Symbol (Rupee / Growth Scale in Gold)
    draw.polygon([(512, 420), (512, 600)], fill=(245, 158, 11, 255), outline=(245, 158, 11, 255), width=24)
    draw.polygon([(460, 470), (564, 470)], fill=(245, 158, 11, 255), outline=(245, 158, 11, 255), width=24)
    draw.polygon([(460, 520), (540, 520)], fill=(245, 158, 11, 255), outline=(245, 158, 11, 255), width=24)

    img.save(os.path.join(assets_dir, "icon.png"))
    img.save(os.path.join(assets_dir, "android-icon-foreground.png"))

create_app_icon()

# 2. Splash Icon (512x512)
def create_splash_icon():
    size = (512, 512)
    img = Image.new("RGBA", size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    bg_color = (46, 125, 50, 255)
    draw.rounded_rectangle([20, 20, 492, 492], radius=110, fill=bg_color)

    # Leaf + Growth Scale
    draw.polygon([(256, 120), (160, 240), (200, 360), (256, 400), (312, 360), (352, 240)], fill=(255, 255, 255, 255))
    draw.polygon([(256, 150), (220, 240), (256, 350), (292, 240)], fill=bg_color)
    draw.polygon([(256, 200), (256, 310)], fill=(245, 158, 11, 255), outline=(245, 158, 11, 255), width=12)

    img.save(os.path.join(assets_dir, "splash-icon.png"))

create_splash_icon()

# 3. Main Brand Logo with Text (800x300)
def create_brand_logo():
    size = (800, 300)
    img = Image.new("RGBA", size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Icon Circle Left
    bg_color = (46, 125, 50, 255)
    draw.rounded_rectangle([30, 40, 220, 230], radius=45, fill=bg_color)

    draw.polygon([(125, 75), (75, 135), (95, 195), (125, 210), (155, 195), (175, 135)], fill=(255, 255, 255, 255))
    draw.polygon([(125, 90), (105, 135), (125, 190), (145, 135)], fill=bg_color)
    draw.polygon([(125, 115), (125, 175)], fill=(245, 158, 11, 255), outline=(245, 158, 11, 255), width=8)

    # Try loading system font
    try:
        font_title = ImageFont.truetype("arial.ttf", 68)
        font_sub = ImageFont.truetype("arial.ttf", 26)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Draw Text "PikMoolya"
    draw.text((260, 65), "PikMoolya", fill=(27, 77, 30, 255), font=font_title)
    # Tagline
    draw.text((264, 150), "Fair Price. Direct Market Access.", fill=(91, 107, 93, 255), font=font_sub)

    img.save(os.path.join(assets_dir, "logo-main.png"))

create_brand_logo()

# 4. Header Logo (500x120)
def create_header_logo():
    size = (500, 120)
    img = Image.new("RGBA", size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Small Icon Left
    bg_color = (46, 125, 50, 255)
    draw.rounded_rectangle([10, 15, 90, 95], radius=20, fill=bg_color)

    draw.polygon([(50, 30), (30, 55), (40, 80), (50, 85), (60, 80), (70, 55)], fill=(255, 255, 255, 255))
    draw.polygon([(50, 38), (42, 55), (50, 78), (58, 55)], fill=bg_color)

    try:
        font_title = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 14)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((110, 25), "PikMoolya", fill=(27, 77, 30, 255), font=font_title)
    draw.text((112, 70), "AI Fair Price Marketplace", fill=(91, 107, 93, 255), font=font_sub)

    img.save(os.path.join(assets_dir, "logo-header.png"))

create_header_logo()

print("All PikMoolya brand logo assets created successfully!")
