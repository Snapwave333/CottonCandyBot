import os
import random
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Configuration
ASSETS_DIR = os.path.join(os.getcwd(), 'public', 'assets', 'generated')
FONT_PATH = "arial.ttf"  # Default Windows font
BRAND_COLORS = {
    'primary': (255, 105, 180),   # Hot Pink
    'secondary': (0, 191, 255),   # Deep Sky Blue
    'background': (20, 20, 30),   # Dark Navy
    'glass': (255, 255, 255, 20), # Transparent White
    'text': (255, 255, 255)       # White
}

def ensure_directory():
    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)
        print(f"Created directory: {ASSETS_DIR}")

def load_font(size):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except IOError:
        return ImageFont.load_default()

def draw_neural_background(draw, width, height, node_count=50):
    """Draws a generative AI-style neural network background."""
    nodes = []
    for _ in range(node_count):
        x = random.randint(0, width)
        y = random.randint(0, height)
        nodes.append((x, y))
        # Draw faint node
        draw.ellipse([x-2, y-2, x+2, y+2], fill=BRAND_COLORS['secondary'] + (100,))

    # Connect nodes
    for i, node_a in enumerate(nodes):
        for node_b in nodes[i+1:]:
            dist = math.hypot(node_a[0] - node_b[0], node_a[1] - node_b[1])
            if dist < 150:
                opacity = int((1 - dist/150) * 100)
                draw.line([node_a, node_b], fill=BRAND_COLORS['primary'] + (opacity,), width=1)

def create_feature_card(filename, title, description, icon_symbol="⚡"):
    """Generates a glassmorphic feature card."""
    width, height = 800, 400
    img = Image.new('RGB', (width, height), BRAND_COLORS['background'])
    draw = ImageDraw.Draw(img, 'RGBA')

    # 1. Background Art
    draw_neural_background(draw, width, height)

    # 2. Glassmorphic Card Container
    margin = 40
    shape = [margin, margin, width-margin, height-margin]
    draw.rectangle(shape, fill=BRAND_COLORS['glass'], outline=BRAND_COLORS['secondary'], width=2)

    # 3. Text & Icon
    title_font = load_font(48)
    desc_font = load_font(24)
    icon_font = load_font(80)

    # Draw Icon
    draw.text((80, 80), icon_symbol, font=icon_font, fill=BRAND_COLORS['primary'])

    # Draw Title
    draw.text((80, 180), title, font=title_font, fill=BRAND_COLORS['text'])

    # Draw Description (Word Wrap simplified)
    words = description.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(" ".join(current_line)) > 45: # Approx char limit
            lines.append(" ".join(current_line[:-1]))
            current_line = [word]
    lines.append(" ".join(current_line))

    y_text = 250
    for line in lines:
        draw.text((80, y_text), line, font=desc_font, fill=(200, 200, 200))
        y_text += 35

    # Save
    output_path = os.path.join(ASSETS_DIR, filename)
    img.save(output_path)
    print(f"Generated: {output_path}")
    return output_path

def create_section_header(filename, text, subtitle):
    """Generates a stylish section header."""
    width, height = 1200, 200
    img = Image.new('RGB', (width, height), BRAND_COLORS['background'])
    draw = ImageDraw.Draw(img, 'RGBA')

    # Abstract Gradient/Shapes
    for i in range(20):
        x = random.randint(-100, width)
        y = random.randint(-100, height)
        size = random.randint(50, 200)
        color = random.choice([BRAND_COLORS['primary'], BRAND_COLORS['secondary']])
        draw.ellipse([x, y, x+size, y+size], fill=color + (30,))

    # Text
    title_font = load_font(60)
    sub_font = load_font(30)

    # Center Text
    # Note: Pillow's textbbox is better but getsize is legacy. Using anchor for simplicity if PIL version allows, else manual calc.
    # Assuming modern Pillow (10+)
    draw.text((width/2, height/2 - 20), text, font=title_font, fill=BRAND_COLORS['text'], anchor="mm")
    draw.text((width/2, height/2 + 40), subtitle, font=sub_font, fill=(200, 200, 255), anchor="mm")

    output_path = os.path.join(ASSETS_DIR, filename)
    img.save(output_path)
    print(f"Generated: {output_path}")
    return output_path

def update_readme_with_images():
    """Injects the generated images into the README.md file."""
    readme_path = os.path.join(os.getcwd(), 'README.md')
    
    if not os.path.exists(readme_path):
        print("README.md not found!")
        return

    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define injections
    # We will replace the text-based Feature Table with a grid of images if possible, 
    # OR just add the header images above sections.
    
    # 1. Inject Header for Features
    if "## ✨ Key Features" in content:
        # Check if already injected
        if "header_features.png" not in content:
            replacement = "## ✨ Key Features\n\n![Key Features](./public/assets/generated/header_features.png)\n"
            content = content.replace("## ✨ Key Features", replacement)

    # 2. Inject Feature Cards (Append to features section)
    # We'll add a showcase grid below the table
    showcase_md = "\n### 📸 Feature Showcase\n<div align=\"center\">\n  <img src=\"./public/assets/generated/card_speed.png\" width=\"45%\"> \n  <img src=\"./public/assets/generated/card_security.png\" width=\"45%\">\n  <br>\n  <img src=\"./public/assets/generated/card_strategy.png\" width=\"45%\">\n  <img src=\"./public/assets/generated/card_ui.png\" width=\"45%\">\n</div>\n"
    
    if "### 📸 Feature Showcase" not in content and "| 🔌 **Hybrid Wallet System** |" in content:
        # Insert after the table
        parts = content.split("| 🔌 **Hybrid Wallet System** |")
        # Find end of table row
        rest = parts[1]
        line_end_index = rest.find("\n", rest.find("\n") + 1) # Skip the current line and the next divider line if any? 
        # Actually the table row ends at newline.
        # Let's just find the next "---"
        insert_pos = content.find("---", content.find("## ✨ Key Features"))
        
        if insert_pos != -1:
            content = content[:insert_pos] + showcase_md + "\n" + content[insert_pos:]

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("README.md updated with new assets.")

def main():
    print("🍬 Cotton Candy Asset Generator Starting...")
    ensure_directory()

    try:
        # Generate Section Headers
        create_section_header("header_features.png", "POWERFUL FEATURES", "Engineered for Domination")
        create_section_header("header_architecture.png", "SYSTEM ARCHITECTURE", "Robust & Scalable Design")

        # Generate Feature Cards
        create_feature_card("card_speed.png", "High-Speed Execution", "Sub-200ms tick-loops powered by optimized Node.js workers for instant reaction times.", "🚀")
        create_feature_card("card_security.png", "MEV Protection", "Integrated Jito bundles ensure your transactions are sandwich-proof and secure.", "🛡️")
        create_feature_card("card_strategy.png", "Smart Strategies", "Pre-loaded with Sniper, DCA, and Momentum algorithms ready to deploy.", "🧠")
        create_feature_card("card_ui.png", "Glassmorphic UI", "A stunning Next.js dashboard providing real-time telemetry and control.", "💎")

        # Update README
        update_readme_with_images()
        print("✅ Asset generation complete!")

    except Exception as e:
        print(f"❌ Error during asset generation: {e}")

if __name__ == "__main__":
    main()
