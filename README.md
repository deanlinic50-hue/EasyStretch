# EasyStretch

A PixInsight script for interactive stretching of RGB/OSC astronomical images with a live preview panel.

![EasyStretch Screenshot](screenshot.png)

## Features

- **Live preview** at 1/4 resolution — fast response on large images
- **Blackpoint** — set the black point before stretching
- **General Stretch** — MTF-based stretch (0–30)
- **Contrast** — S-curve contrast adjustment (±8)
- **Background** — fine-tune background level
- **Midtones** — adjust mid-tone brightness
- **Highlights** — protect or enhance bright regions
- **Apply & Continue** — multi-layer stretching like GHS, bakes parameters and resets sliders
- **Create New Photo** — outputs a new image, original untouched
- **Image selector** — dropdown to switch between open images
- Canvas auto-adapts to each image's aspect ratio

## Requirements

- PixInsight 1.9.3 or later
- No external plugins required

## Installation

### Option A — Manual
1. Download `EasyStretch.js`
2. In PixInsight: `Script → Feature Scripts → Add`
3. Navigate to the folder containing `EasyStretch.js`
4. Click `Done`
5. The script appears under `Script → Utilities → EasyStretch`

### Option B — Direct execution
1. Download `EasyStretch.js`
2. In PixInsight: `Script → Execute Script File`
3. Select `EasyStretch.js`

## Usage

1. Open a linear (unstretched) RGB or OSC image in PixInsight
2. Run EasyStretch
3. Select your image from the dropdown if multiple are open
4. Adjust **Group 1** sliders for initial stretch
5. Fine-tune with **Group 2** sliders
6. Click **▶ Apply & Continue** to bake and stretch further
7. Repeat as needed — title shows `[layer N]` count
8. Click **✅ Create New Photo** when satisfied

## Tips

- Start with **Blackpoint** to clip the background before stretching
- Use **Apply & Continue** multiple times for gentle multi-layer stretching
- **Midtones**: right = brighter, left = darker
- **Highlights**: left of center = darken bright areas, right = brighten

## License

Copyright © 2026 Dean Linic  
Free to use and modify with attribution.
