# BLE Mesh Scanner - Web Interface

A clean, modern web interface for real-time Bluetooth Low Energy (BLE) device scanning and visualization.

## Features

### 🎯 Core Functionality
- **Real-time Device Tracking**: Live updates every second
- **Auto-removal**: Devices disappear after 60 seconds of no response
- **Distance Visualization**: RSSI-based distance estimation with radar view
- **Search & Filter**: Find devices by name, MAC, or manufacturer
- **Detailed Device Info**: Click any device for full details

### 📊 Distance Estimation

Based on RSSI (signal strength):
- **Close** (< 2m): RSSI -30 to -50 dBm - Green
- **Medium** (2-5m): RSSI -50 to -70 dBm - Orange
- **Far** (> 5m): RSSI -70 to -100 dBm - Red

### 🎨 Visual Design

**Clean Modern Theme**:
- Dark mode interface optimized for extended use
- Gradient accents (blue/purple)
- Smooth animations and transitions
- Responsive layout (desktop/tablet/mobile)

**Radar Visualization**:
- Concentric circles showing distance zones
- Real-time device positioning
- Visual connection lines from center (you) to devices
- Pulse effect for nearby devices

## Data Structure

The interface consumes JSON from `/api/devices`:

```json
{
  "AA:BB:CC:DD:EE:FF": {
    "rssi": -65,
    "addr": "AA:BB:CC:DD:EE:FF",
    "manuf": "Apple Inc.",
    "vendor": "Apple",
    "name": "iPhone",
    "uuid": ["180F", "180A"],
    "up_time": 1706574123.45
  }
}
```

## How It Works

### 60-Second Timeout Logic

```javascript
const TIMEOUT_SECONDS = 60;
const now = Date.now() / 1000;
const age = now - device.up_time;

if (age > 60) {
    // Device is removed from display
}
```

Devices are only shown if they were seen within the last 60 seconds.

### Distance Calculation

```javascript
function calculateDistance(rssi) {
    if (rssi >= -50) return 'close';   // 0-2m
    if (rssi >= -70) return 'medium';  // 2-5m
    return 'far';                      // 5m+
}
```

### Stats Tracking

- **Active**: Devices seen in last 60 seconds
- **Total**: All unique devices discovered in session

## File Structure

```
web/
├── index.html    - Main HTML structure
├── style.css     - Modern CSS styling
├── app.js        - Core application logic
└── README.md     - This file
```

## Usage

The web server automatically serves this interface. Simply:

1. Start the BLE scanner (Python backend)
2. Web server starts at `http://localhost:8000`
3. Open in browser
4. View live BLE devices in your area

## Features Breakdown

### Header
- Logo and title
- Active scan indicator (pulsing dot)
- Active/Total device counters

### Radar Section
- Canvas-based radar visualization
- Distance rings (close/medium/far)
- Device dots positioned by distance
- Grid overlay for orientation

### Device List
- Scrollable list of active devices
- Search bar for filtering
- Sort options (distance, name, signal)
- Color-coded distance badges
- Signal strength bars
- Click to view details

### Device Modal
- Full device information
- MAC address, manufacturer, vendor
- Signal strength and distance
- Last seen timestamp
- Service UUIDs

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS/Android)

## Performance

- Minimal CPU usage
- Efficient canvas rendering
- Throttled updates (1 second intervals)
- Smooth 60fps animations
- Optimized for 100+ devices

## Customization

Easy to customize via CSS variables in `style.css`:

```css
:root {
    --bg-primary: #0f172a;      /* Main background */
    --accent-primary: #3b82f6;  /* Primary accent color */
    --close-color: #10b981;     /* Close distance color */
    --medium-color: #f59e0b;    /* Medium distance color */
    --far-color: #ef4444;       /* Far distance color */
}
```

## API Endpoints Used

- `GET /api/devices` - Live device data (updated constantly)
- `GET /api/wardriving` - Historical device data

## Technical Notes

- No external dependencies (vanilla JS)
- Uses HTML5 Canvas for radar
- CSS Grid for responsive layout
- LocalStorage not used (fresh state on reload)
- All data is ephemeral (lost on page refresh)

---

**Built for NSM BLE Mesh Scanner**
Clean, fast, focused on what matters.
