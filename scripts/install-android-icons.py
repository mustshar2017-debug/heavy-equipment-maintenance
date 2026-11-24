from pathlib import Path
from PIL import Image

source = Image.open('assets/brand-logo.jpg').convert('RGBA')
root = Path('android/app/src/main/res')
for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    folder = root / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    icon = source.resize((size,size), Image.Resampling.LANCZOS)
    icon.save(folder / 'ic_launcher.png', optimize=True)
    icon.save(folder / 'ic_launcher_round.png', optimize=True)
# Use the density-specific image resources on all Android versions.
for name in ('ic_launcher.xml','ic_launcher_round.xml'):
    adaptive = root / 'mipmap-anydpi-v26' / name
    if adaptive.exists():
        adaptive.unlink()
print('Official Wad Kenana launcher icons installed.')
