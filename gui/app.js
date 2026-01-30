// BLE Mesh Scanner Application
class BLEScanner {
    constructor() {
        this.devices = new Map();
        this.allDevicesEver = new Set();
        this.canvas = document.getElementById('radar-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.searchBox = document.getElementById('search-box');
        this.sortSelect = document.getElementById('sort-select');
        this.devicesList = document.getElementById('devices-list');

        this.TIMEOUT_SECONDS = 60;
        this.UPDATE_INTERVAL = 1000; // 1 second

        this.initCanvas();
        this.attachEventListeners();
        this.startScanning();
    }

    initCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.offsetWidth, container.offsetHeight);
        this.canvas.width = size;
        this.canvas.height = size;
    }

    attachEventListeners() {
        this.searchBox.addEventListener('input', () => this.renderDevicesList());
        this.sortSelect.addEventListener('change', () => this.renderDevicesList());
        window.addEventListener('resize', () => this.initCanvas());
    }

    async fetchDevices() {
        try {
            const response = await fetch('/api/devices');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching devices:', error);
            return {};
        }
    }

    calculateDistance(rssi) {
        // RSSI to approximate distance
        // -30 to -50 = very close (0-2m)
        // -50 to -70 = medium (2-5m)
        // -70 to -100 = far (5m+)

        if (rssi >= -50) return { range: 'close', meters: '< 2m', distance: 1 };
        if (rssi >= -70) return { range: 'medium', meters: '2-5m', distance: 3 };
        return { range: 'far', meters: '> 5m', distance: 6 };
    }

    isDeviceAlive(uptime) {
        const now = Date.now() / 1000; // Convert to seconds
        const age = now - uptime;
        return age <= this.TIMEOUT_SECONDS;
    }

    async updateDevices() {
        const deviceData = await this.fetchDevices();
        const now = Date.now() / 1000;

        // Track all devices ever seen
        Object.keys(deviceData).forEach(mac => this.allDevicesEver.add(mac));

        // Clear devices map
        this.devices.clear();

        // Process and filter devices
        for (const [mac, info] of Object.entries(deviceData)) {
            const uptime = info.up_time || 0;

            // Only add device if it's alive (seen within last 60 seconds)
            if (this.isDeviceAlive(uptime)) {
                const rssi = info.rssi || -100;
                const distanceInfo = this.calculateDistance(rssi);

                this.devices.set(mac, {
                    mac: mac,
                    name: info.name || 'Unknown Device',
                    manufacturer: info.manuf || info.vendor || 'Unknown',
                    vendor: info.vendor || 'Unknown',
                    rssi: rssi,
                    uuid: info.uuid || [],
                    uptime: uptime,
                    age: now - uptime,
                    ...distanceInfo
                });
            }
        }

        this.updateUI();
    }

    updateUI() {
        this.updateStats();
        this.renderRadar();
        this.renderDevicesList();
    }

    updateStats() {
        document.getElementById('active-count').textContent = this.devices.size;
        document.getElementById('total-count').textContent = this.allDevicesEver.size;
    }

    renderRadar() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2 - 20;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw concentric circles (distance rings)
        this.drawRadarRings(centerX, centerY, maxRadius);

        // Draw devices
        this.drawDevicesOnRadar(centerX, centerY, maxRadius);
    }

    drawRadarRings(centerX, centerY, maxRadius) {
        const rings = [
            { radius: maxRadius * 0.3, color: '#10b98133', label: 'Close' },
            { radius: maxRadius * 0.6, color: '#f59e0b33', label: 'Medium' },
            { radius: maxRadius * 0.95, color: '#ef444433', label: 'Far' }
        ];

        rings.forEach((ring, index) => {
            // Draw ring
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = ring.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Fill area
            this.ctx.fillStyle = ring.color;
            this.ctx.fill();

            // Draw label
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(ring.label, centerX, centerY - ring.radius - 10);
        });

        // Draw grid lines
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 1;

        // Horizontal
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - maxRadius, centerY);
        this.ctx.lineTo(centerX + maxRadius, centerY);
        this.ctx.stroke();

        // Vertical
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - maxRadius);
        this.ctx.lineTo(centerX, centerY + maxRadius);
        this.ctx.stroke();
    }

    drawDevicesOnRadar(centerX, centerY, maxRadius) {
        const devices = Array.from(this.devices.values());
        const angleStep = (Math.PI * 2) / Math.max(devices.length, 1);

        devices.forEach((device, index) => {
            const angle = index * angleStep;

            // Calculate position based on distance
            let radius;
            let color;

            switch(device.range) {
                case 'close':
                    radius = maxRadius * 0.2;
                    color = '#10b981';
                    break;
                case 'medium':
                    radius = maxRadius * 0.5;
                    color = '#f59e0b';
                    break;
                case 'far':
                    radius = maxRadius * 0.8;
                    color = '#ef4444';
                    break;
            }

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Draw connection line
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.strokeStyle = color + '40';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Draw device dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();

            // Draw device outline
            this.ctx.strokeStyle = '#f1f5f9';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Pulse effect for close devices
            if (device.range === 'close') {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, Math.PI * 2);
                this.ctx.strokeStyle = color + '60';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    renderDevicesList() {
        const searchTerm = this.searchBox.value.toLowerCase();
        const sortBy = this.sortSelect.value;

        let devices = Array.from(this.devices.values());

        // Filter by search
        if (searchTerm) {
            devices = devices.filter(device =>
                device.name.toLowerCase().includes(searchTerm) ||
                device.mac.toLowerCase().includes(searchTerm) ||
                device.manufacturer.toLowerCase().includes(searchTerm)
            );
        }

        // Sort devices
        devices.sort((a, b) => {
            switch(sortBy) {
                case 'distance':
                    return a.distance - b.distance;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rssi':
                    return b.rssi - a.rssi;
                default:
                    return 0;
            }
        });

        // Render
        if (devices.length === 0) {
            this.devicesList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke-width="2"/>
                    </svg>
                    <p>No devices found</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        ${searchTerm ? 'Try a different search term' : 'Waiting for BLE devices...'}
                    </p>
                </div>
            `;
        } else {
            this.devicesList.innerHTML = devices.map(device => this.createDeviceCard(device)).join('');
        }
    }

    createDeviceCard(device) {
        const signalPercent = Math.max(0, Math.min(100, ((device.rssi + 100) / 70) * 100));

        return `
            <div class="device-card ${device.range}" onclick="showDeviceModal('${device.mac}')">
                <div class="device-header">
                    <div class="device-name">${this.escapeHtml(device.name)}</div>
                    <div class="device-distance ${device.range}">${device.meters}</div>
                </div>
                <div class="device-info">
                    <div class="device-mac">${device.mac}</div>
                    <div>${this.escapeHtml(device.manufacturer)}</div>
                </div>
                <div class="device-signal">
                    <div class="signal-bar">
                        <div class="signal-fill" style="width: ${signalPercent}%"></div>
                    </div>
                    <div class="signal-value">${device.rssi} dBm</div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    startScanning() {
        // Initial update
        this.updateDevices();

        // Periodic updates
        setInterval(() => {
            this.updateDevices();
        }, this.UPDATE_INTERVAL);
    }
}

// Modal functions
function showDeviceModal(mac) {
    const scanner = window.bleScanner;
    const device = scanner.devices.get(mac);

    if (!device) return;

    const modal = document.getElementById('device-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-device-name');

    modalTitle.textContent = device.name;

    const uuid = Array.isArray(device.uuid) ? device.uuid.join(', ') : (device.uuid || 'None');

    modalBody.innerHTML = `
        <div class="modal-detail-row">
            <div class="modal-detail-label">MAC Address</div>
            <div class="modal-detail-value">${device.mac}</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Manufacturer</div>
            <div class="modal-detail-value">${device.manufacturer}</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Vendor</div>
            <div class="modal-detail-value">${device.vendor}</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Signal Strength</div>
            <div class="modal-detail-value">${device.rssi} dBm</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Distance</div>
            <div class="modal-detail-value">${device.meters}</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Range</div>
            <div class="modal-detail-value">${device.range}</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Last Seen</div>
            <div class="modal-detail-value">${device.age.toFixed(1)}s ago</div>
        </div>
        <div class="modal-detail-row">
            <div class="modal-detail-label">Service UUIDs</div>
            <div class="modal-detail-value" style="word-break: break-all;">${uuid}</div>
        </div>
    `;

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('device-modal').classList.remove('active');
}

// Close modal on background click
document.getElementById('device-modal').addEventListener('click', (e) => {
    if (e.target.id === 'device-modal') {
        closeModal();
    }
});

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    window.bleScanner = new BLEScanner();
});
