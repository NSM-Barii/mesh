# BLE Mesh Scanner

A Bluetooth Low Energy (BLE) scanner and wardriving tool with real-time web visualization.

## Features

- **Persistent JSON Database** - Stores all discovered devices across all sessions in a permanent database
- **BLE Device Discovery** - Scans for nearby Bluetooth devices and tracks signal strength (RSSI)
- **Distance Estimation** - Calculates approximate distance based on signal strength
- **Movement Detection** - Identifies moving devices through RSSI variance analysis
- **Web GUI** - Real-time radar visualization and device list with cyber-themed interface
- **Wardriving Mode** - Automatic data collection and storage for extended scanning sessions
- **Device Timeout** - Automatically removes stale devices after 60 seconds of inactivity

## Installation

```bash
# Clone the repository
git clone https://github.com/nsm-barii/mesh.git
cd mesh/src

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
```

## Usage

### Wardriving Mode (Silent)
Runs scanner in background, saves all discovered devices to database:
```bash
sudo venv/bin/python main.py -w
```

### Wardriving Mode (Verbose)
Same as above but displays output in terminal:
```bash
sudo venv/bin/python main.py -wv
```

**Note:** `sudo` is required for BLE scanning permissions.

### Access Web GUI
Once running, open your browser to:
```
http://localhost:8000
```

## Web Interface

The GUI provides two views:

1. **Radar View** - Visual representation of nearby devices with:
   - Color-coded distance rings (Close/Medium/Far) based on RSSI
   - Device positions are evenly distributed for visibility (direction is visual only)
   - Movement detection alerts
   - Real-time device list sidebar
   - Search/filter functionality

2. **All Devices** - Detailed table view showing:
   - MAC addresses
   - Manufacturer info
   - RSSI signal strength
   - Service UUIDs
   - Last seen timestamp

**Note:** The radar shows distance estimation only. Device direction/angle is randomized for visualization - RSSI cannot determine actual device location.

## How It Works

- Scans for BLE devices using the Bleak library
- Estimates distance from RSSI signal strength (Close <2m, Medium 2-5m, Far >5m)
- Tracks device history to detect movement through RSSI variance
- Serves web interface on port 8000
- Stores all discovered devices in persistent JSON database across sessions

## Database

All discovered devices are stored in `database/database.json` with:
- MAC address
- Manufacturer data
- Vendor lookup
- RSSI history
- Discovery timestamp
- Session metadata

## Requirements

- **Linux only**
- Python 3.7+
- Bluetooth adapter (built-in or USB)

## Credits

Created by [nsm-barii](https://github.com/nsm-barii)
