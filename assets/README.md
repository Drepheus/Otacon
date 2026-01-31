# Otacon Assets

This folder contains all visual assets for Otacon.

## Required Files

### For Desktop Dashboard

1. **otacon-icon.png** (512x512 or larger)
   - Main application icon
   - Used in taskbar/dock
   - Format: PNG with transparency

2. **tray-icon.png** (16x16, 32x32)
   - System tray icon
   - Should be simple and recognizable at small size
   - Format: PNG

3. **otacon.ico** (Windows)
   - Multi-size icon file
   - Sizes: 16x16, 32x32, 48x48, 256x256
   - Used for Windows executable

4. **otacon.icns** (macOS)
   - macOS icon format
   - Multiple sizes in one file
   - Used for Mac app bundle

## Design Suggestions

### Color Palette
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Background: Dark theme (navy blue)

### Icon Ideas
- Robot/AI face
- Chat bubble with sparkle
- Brain/circuit hybrid
- Owl (wise assistant)

### Tools to Create Icons

**Free Options:**
1. **Figma** (figma.com) - Design tool
2. **Canva** (canva.com) - Simple graphics
3. **GIMP** - Free Photoshop alternative
4. **Inkscape** - Vector graphics

**Icon Generators:**
- appicon.co - Generate all sizes from one image
- iconverticons.com - Convert PNG to ICO/ICNS

## Quick Setup

Don't have icons yet? Use these emoji placeholders temporarily:

Create `temp-icon.html`:
```html
<div style="font-size: 512px;">🤖</div>
```

Screenshot it and save as `otacon-icon.png`.

## Recommended Sizes

| Platform | Size | Format |
|----------|------|--------|
| Windows | 256x256 | .ico |
| macOS | 1024x1024 | .icns |
| Linux | 512x512 | .png |
| Tray | 16x16, 32x32 | .png |

## License

Assets should be original or properly licensed.
Default placeholder: MIT License
