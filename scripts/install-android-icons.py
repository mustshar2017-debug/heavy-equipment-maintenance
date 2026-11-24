from pathlib import Path
from PIL import Image

# Keep the complete round-edged workshop emblem inside Android launcher safe zones.
source = Image.open('assets/brand-logo.jpg').convert('RGBA')
root = Path('android/app/src/main/res')
for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    folder = root / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    canvas = Image.new('RGBA', (size, size), (5, 8, 14, 255))
    inset = int(size * 0.78)
    icon = source.copy()
    icon.thumbnail((inset, inset), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icon, ((size-icon.width)//2, (size-icon.height)//2))
    canvas.save(folder / 'ic_launcher.png', optimize=True)
    canvas.save(folder / 'ic_launcher_round.png', optimize=True)
for name in ('ic_launcher.xml','ic_launcher_round.xml'):
    adaptive = root / 'mipmap-anydpi-v26' / name
    if adaptive.exists():
        adaptive.unlink()
print('Complete logo fitted inside Android launcher safe zone.')
