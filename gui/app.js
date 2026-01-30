class BLEScanner {
    constructor() {
        this.devices = new Map();
        this.allDevices = new Set();
        this.signalHistory = new Map();
        this.canvas = document.getElementById('radar-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.TIMEOUT = 60;
        this.UPDATE_INTERVAL = 1000;
        this.startTime = Date.now();

        this.initCanvas();
        this.initTabs();
        this.initSearch();
        this.updateElapsedTime();
        this.start();
    }

    updateElapsedTime() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('elapsed-time').textContent = `${hours}:${minutes}:${seconds}`;
        }, 1000);
    }

    initCanvas() {
        const wrapper = this.canvas.parentElement;
        const size = Math.min(wrapper.offsetWidth, wrapper.offsetHeight);
        this.canvas.width = size;
        this.canvas.height = size;
        window.addEventListener('resize', () => this.initCanvas());
    }

    initTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                // Update tabs
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${target}-view`).classList.add('active');

                if (target === 'table') {
                    this.renderTable();
                }
            });
        });
    }

    initSearch() {
        document.getElementById('search').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderDeviceList();
        });

        document.getElementById('table-search').addEventListener('input', (e) => {
            this.tableSearchTerm = e.target.value.toLowerCase();
            this.renderTable();
        });
    }

    async fetchDevices() {
        try {
            const response = await fetch('/api/devices');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return {};
        }
    }

    calculateDistance(rssi) {
        if (rssi >= -50) return { range: 'close', meters: '<2m', distance: 1 };
        if (rssi >= -70) return { range: 'medium', meters: '2-5m', distance: 3 };
        return { range: 'far', meters: '>5m', distance: 6 };
    }

    isAlive(uptime) {
        const now = Date.now() / 1000;
        const age = now - uptime;
        return age <= this.TIMEOUT;
    }

    detectMovement(mac, rssi) {
        if (!this.signalHistory.has(mac)) {
            this.signalHistory.set(mac, []);
        }

        const history = this.signalHistory.get(mac);
        history.push(rssi);

        if (history.length > 10) history.shift();

        if (history.length < 5) return false;

        // Calculate variance
        const mean = history.reduce((a, b) => a + b, 0) / history.length;
        const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);

        // If standard deviation > 5, device is likely moving
        return stdDev > 5;
    }

    async update() {
        const data = await this.fetchDevices();
        const now = Date.now() / 1000;

        // Track all devices
        Object.keys(data).forEach(mac => this.allDevices.add(mac));

        // Clear and rebuild active devices
        this.devices.clear();

        for (const [mac, info] of Object.entries(data)) {
            const uptime = info.up_time || 0;

            if (this.isAlive(uptime)) {
                const rssi = info.rssi || -100;
                const distanceInfo = this.calculateDistance(rssi);
                const isMoving = this.detectMovement(mac, rssi);

                this.devices.set(mac, {
                    mac,
                    name: info.name || 'Unknown Device',
                    manufacturer: info.manuf || 'Unknown',
                    vendor: info.vendor || 'Unknown',
                    rssi,
                    uuid: Array.isArray(info.uuid) ? info.uuid.join(', ') : (info.uuid || 'None'),
                    uptime,
                    age: now - uptime,
                    isMoving,
                    ...distanceInfo
                });
            }
        }

        this.render();
    }

    render() {
        this.updateStats();
        this.renderRadar();
        this.renderDeviceList();
    }

    updateStats() {
        document.getElementById('active-count').textContent = this.devices.size;
        document.getElementById('total-count').textContent = this.allDevices.size;
    }

    renderRadar() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.min(w, h) / 2 - 30;

        // Clear
        this.ctx.clearRect(0, 0, w, h);

        // Draw rings
        const rings = [
            { r: maxR * 0.3, color: '#10b981', label: 'CLOSE' },
            { r: maxR * 0.6, color: '#f59e0b', label: 'MEDIUM' },
            { r: maxR * 0.95, color: '#ef4444', label: 'FAR' }
        ];

        rings.forEach(ring => {
            // Ring circle
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            this.ctx.strokeStyle = ring.color + '40';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Fill
            this.ctx.fillStyle = ring.color + '10';
            this.ctx.fill();

            // Label
            this.ctx.fillStyle = ring.color;
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(ring.label, cx, cy - ring.r - 12);
        });

        // Grid
        this.ctx.strokeStyle = '#2d374840';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - maxR, cy);
        this.ctx.lineTo(cx + maxR, cy);
        this.ctx.moveTo(cx, cy - maxR);
        this.ctx.lineTo(cx, cy + maxR);
        this.ctx.stroke();

        // Draw devices
        const devices = Array.from(this.devices.values());
        const step = (Math.PI * 2) / Math.max(devices.length, 1);

        devices.forEach((device, i) => {
            const angle = i * step;
            let r, color;

            switch (device.range) {
                case 'close':
                    r = maxR * 0.2;
                    color = '#10b981';
                    break;
                case 'medium':
                    r = maxR * 0.5;
                    color = '#f59e0b';
                    break;
                case 'far':
                    r = maxR * 0.8;
                    color = '#ef4444';
                    break;
            }

            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            // Connection line
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy);
            this.ctx.lineTo(x, y);
            this.ctx.strokeStyle = color + '30';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Device dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#e2e8f0';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Label on dot
            this.ctx.fillStyle = '#0f1419';
            this.ctx.font = 'bold 10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(i + 1, x, y);

            // Device name near dot
            this.ctx.fillStyle = color;
            this.ctx.font = '11px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            const name = device.name.length > 12 ? device.name.substring(0, 12) + '...' : device.name;
            this.ctx.fillText(name, x, y + 12);
        });
    }

    renderDeviceList() {
        const list = document.getElementById('device-list');
        let devices = Array.from(this.devices.values());

        // Filter by search
        if (this.searchTerm) {
            devices = devices.filter(d =>
                d.name.toLowerCase().includes(this.searchTerm) ||
                d.mac.toLowerCase().includes(this.searchTerm) ||
                d.manufacturer.toLowerCase().includes(this.searchTerm)
            );
        }

        // Sort by distance
        devices.sort((a, b) => a.distance - b.distance);

        if (devices.length === 0) {
            list.innerHTML = '<div class="empty-state">No devices found</div>';
            return;
        }

        list.innerHTML = devices.map((d, i) => `
            <div class="device-card ${d.range} ${d.isMoving ? 'moving' : ''}">
                <div class="device-name">${i + 1}. ${this.escape(d.name)}</div>
                <div class="device-info">
                    <div class="device-info-row">
                        <span class="device-label">MAC:</span>
                        <span class="device-value">${d.mac}</span>
                    </div>
                    <div class="device-info-row">
                        <span class="device-label">Manufacturer:</span>
                        <span class="device-value">${this.escape(d.manufacturer)}</span>
                    </div>
                    <div class="device-info-row">
                        <span class="device-label">RSSI:</span>
                        <span class="device-value">${d.rssi} dBm</span>
                    </div>
                </div>
                <div class="device-distance ${d.range}">${d.meters}</div>
            </div>
        `).join('');
    }

    renderTable() {
        const tbody = document.getElementById('table-body');
        let devices = Array.from(this.devices.values());

        // Filter by search
        if (this.tableSearchTerm) {
            devices = devices.filter(d =>
                d.name.toLowerCase().includes(this.tableSearchTerm) ||
                d.mac.toLowerCase().includes(this.tableSearchTerm) ||
                d.manufacturer.toLowerCase().includes(this.tableSearchTerm) ||
                d.vendor.toLowerCase().includes(this.tableSearchTerm)
            );
        }

        if (devices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No devices found</td></tr>';
            return;
        }

        tbody.innerHTML = devices.map((d, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${this.escape(d.name)}</td>
                <td class="mac-address">${d.mac}</td>
                <td>${this.escape(d.manufacturer)}</td>
                <td>${this.escape(d.vendor)}</td>
                <td>${d.rssi} dBm</td>
                <td><span class="distance-badge ${d.range}">${d.meters}</span></td>
                <td>${d.age.toFixed(1)}s ago</td>
                <td class="uuid-list">${d.uuid}</td>
            </tr>
        `).join('');
    }

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    start() {
        this.update();
        setInterval(() => this.update(), this.UPDATE_INTERVAL);
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.scanner = new BLEScanner();
});
