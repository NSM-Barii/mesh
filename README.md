# Bluehound

A Bluetooth Low Energy (BLE) wardriving tool with real-time web visualization.

## Features

- **Persistent JSON Database** - Stores all discovered devices across sessions
- **Real-time Web GUI** - Radar visualization with distance estimation and device tracking
- **Movement Detection** - Identifies moving devices through RSSI variance
- **Wardriving Mode** - Extended scanning with automatic data collection

## Installation

```bash
# Clone the repository
git clone https://github.com/nsm-barii/bluehound.git
cd bluehound/src

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
```

## Usage

Run the scanner with wardriving mode:
```bash
sudo venv/bin/python main.py -w
```

Access the web interface at `http://localhost:8000`

**Note:** `sudo` is required for BLE scanning permissions.

## How It Works

Scans for BLE devices, estimates distance from RSSI, detects movement through signal variance, and stores all discovered devices persistently in `database/database.json`. Web interface runs on port 8000 with radar visualization (distance only - direction is randomized for display).

## Requirements

- **Linux only**
- Python 3.7+
- Bluetooth adapter (built-in or USB)

## Credits

Created by [nsm-barii](https://github.com/nsm-barii)
