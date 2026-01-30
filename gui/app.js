// Device tracking and visualization
class BLEProximityMonitor {
    constructor() {
        this.devices = new Map();
        this.signalHistory = new Map();
        this.movementMetrics = new Map();
        this.wardrivingData = {};
        this.knownDevices = new Set(); // Track known devices for alerts
        this.deviceTimeline = []; // Track device count over time
        this.maxHistoryLength = 30;
        this.updateInterval = 1000;
        this.currentTab = 'dashboard';
        this.sessionStart = Date.now();
        this.radarSweepAngle = 0;
        this.hoveredDevice = null;
        this.devicePositions = new Map(); // Track device positions on radar for click detection

        this.radarCanvas = document.getElementById('radar-canvas');
        this.radarCtx = this.radarCanvas.getContext('2d');
        this.historyCanvas = document.getElementById('history-canvas');
        this.historyCtx = this.historyCanvas.getContext('2d');
        this.timelineCanvas = document.getElementById('timeline-canvas');
        this.timelineCtx = this.timelineCanvas.getContext('2d');
        this.histogramCanvas = document.getElementById('histogram-canvas');
        this.histogramCtx = this.histogramCanvas.getContext('2d');

        this.selectedDevice = null;
        this.searchFilter = '';
        this.manufacturerFilter = 'all';

        this.initCanvas();
        this.initTabs();
        this.initKeyboardShortcuts();
        this.initRadarInteraction();
        this.initThemeToggle();
        this.startMonitoring();
        this.updateTimestamp();
    }

    initTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Filters
        document.getElementById('search-filter').addEventListener('input', (e) => {
            this.searchFilter = e.target.value.toLowerCase();
            this.renderWardrivingTable();
        });

        document.getElementById('manufacturer-filter').addEventListener('change', (e) => {
            this.manufacturerFilter = e.target.value;
            this.renderWardrivingTable();
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Fetch wardriving data if switching to that tab
        if (tabName === 'wardriving') {
            this.fetchWardrivingData();
        }
    }

    initCanvas() {
        // Set canvas size
        this.radarCanvas.width = 600;
        this.radarCanvas.height = 600;
        this.historyCanvas.width = 280;
        this.historyCanvas.height = 150;
        this.timelineCanvas.width = 280;
        this.timelineCanvas.height = 150;
        this.histogramCanvas.width = 280;
        this.histogramCanvas.height = 150;
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

            if (e.key === '1') {
                this.switchTab('dashboard');
            } else if (e.key === '2') {
                this.switchTab('wardriving');
            }
        });
    }

    initRadarInteraction() {
        // Mouse move for hover detection
        this.radarCanvas.addEventListener('mousemove', (e) => {
            const rect = this.radarCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if hovering over a device
            let foundDevice = null;
            this.devicePositions.forEach((pos, mac) => {
                const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (dist < 10) {
                    foundDevice = mac;
                }
            });

            this.hoveredDevice = foundDevice;
            this.radarCanvas.style.cursor = foundDevice ? 'pointer' : 'default';
        });

        // Click to select device
        this.radarCanvas.addEventListener('click', (e) => {
            const rect = this.radarCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.devicePositions.forEach((pos, mac) => {
                const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (dist < 10) {
                    this.selectedDevice = mac;
                    this.render();
                }
            });
        });
    }

    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

    showDeviceTooltip(event, device) {
        // Create or get tooltip element
        let tooltip = document.getElementById('device-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'device-tooltip';
            tooltip.className = 'device-tooltip';
            document.body.appendChild(tooltip);
        }

        const metrics = this.movementMetrics.get(device.mac) || {};

        tooltip.innerHTML = `
            <div class="tooltip-header">${device.name}</div>
            <div class="tooltip-row">
                <span class="tooltip-label">MAC:</span>
                <span class="tooltip-value">${device.mac}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Manufacturer:</span>
                <span class="tooltip-value">${device.manufacturer || 'Unknown'}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">RSSI:</span>
                <span class="tooltip-value">${device.rssi} dBm</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Proximity:</span>
                <span class="tooltip-value">${device.proximity.toUpperCase()}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">Movement:</span>
                <span class="tooltip-value">${device.movement}%</span>
            </div>
            ${metrics.direction ? `
            <div class="tooltip-row">
                <span class="tooltip-label">Direction:</span>
                <span class="tooltip-value">${metrics.direction.toUpperCase()}</span>
            </div>` : ''}
            ${metrics.velocity ? `
            <div class="tooltip-row">
                <span class="tooltip-label">Velocity:</span>
                <span class="tooltip-value">${metrics.velocity.toUpperCase()}</span>
            </div>` : ''}
        `;

        tooltip.classList.add('show');

        // Position tooltip near cursor
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
    }

    hideDeviceTooltip() {
        const tooltip = document.getElementById('device-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    getManufacturerIcon(manufacturer) {
        return ManufacturerIcons.getIcon(manufacturer);
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

    calculateProximity(rssi) {
        // Convert RSSI to approximate distance category
        // RSSI values typically range from -30 (very close) to -100 (far)
        if (rssi >= -50) return 'immediate';
        if (rssi >= -70) return 'near';
        return 'far';
    }

    calculateMovementConfidence(mac) {
        const history = this.signalHistory.get(mac) || [];
        if (history.length < 5) return 0;

        // Use recent samples (last 15 readings)
        const recent = history.slice(-15);
        const n = recent.length;

        // 1. Calculate mean and standard deviation
        const mean = recent.reduce((sum, val) => sum + val, 0) / n;
        const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        // 2. Calculate rate of change (velocity)
        let totalChange = 0;
        for (let i = 1; i < recent.length; i++) {
            totalChange += Math.abs(recent[i] - recent[i - 1]);
        }
        const avgChange = totalChange / (recent.length - 1);

        // 3. Calculate trend (direction of movement)
        const recentHalf = recent.slice(-5);
        const olderHalf = recent.slice(0, 5);
        const recentMean = recentHalf.reduce((sum, val) => sum + val, 0) / recentHalf.length;
        const olderMean = olderHalf.reduce((sum, val) => sum + val, 0) / olderHalf.length;
        const trendDelta = Math.abs(recentMean - olderMean);

        // 4. Noise filtering - environmental variance threshold
        const noiseThreshold = 3; // dBm - typical environmental fluctuation

        // 5. Calculate movement score
        let movementScore = 0;

        // Standard deviation component (30% weight)
        // High variance indicates movement or instability
        movementScore += Math.min(30, stdDev * 3);

        // Rate of change component (40% weight)
        // Rapid changes indicate active movement
        movementScore += Math.min(40, avgChange * 4);

        // Trend component (30% weight)
        // Consistent directional change indicates sustained movement
        movementScore += Math.min(30, trendDelta * 3);

        // Filter out environmental noise
        if (stdDev < noiseThreshold && avgChange < 2) {
            movementScore = Math.max(0, movementScore - 20);
        }

        // Store advanced metrics for display
        this.movementMetrics.set(mac, {
            variance: variance,
            stdDev: stdDev,
            avgChange: avgChange,
            trend: recentMean - olderMean, // Positive = getting closer, negative = moving away
            direction: recentMean > olderMean ? 'approaching' : 'leaving',
            velocity: avgChange > 3 ? 'fast' : avgChange > 1.5 ? 'medium' : 'slow'
        });

        return Math.min(100, Math.max(0, Math.round(movementScore)));
    }

    updateDeviceHistory(mac, rssi) {
        if (!this.signalHistory.has(mac)) {
            this.signalHistory.set(mac, []);
        }
        const history = this.signalHistory.get(mac);
        history.push(rssi);

        // Keep only recent history
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
    }

    async updateDevices() {
        const deviceData = await this.fetchDevices();

        // Clear old devices
        const currentMacs = new Set(Object.keys(deviceData));
        for (let mac of this.devices.keys()) {
            if (!currentMacs.has(mac)) {
                this.devices.delete(mac);
                this.signalHistory.delete(mac);
            }
        }

        // Update devices
        for (let [mac, info] of Object.entries(deviceData)) {
            const rssi = info.rssi || -100;
            this.updateDeviceHistory(mac, rssi);

            // Track known devices
            if (!this.knownDevices.has(mac)) {
                this.knownDevices.add(mac);
            }

            this.devices.set(mac, {
                mac: mac,
                name: info.name || 'Unknown Device',
                rssi: rssi,
                proximity: this.calculateProximity(rssi),
                movement: this.calculateMovementConfidence(mac),
                manufacturer: info.manufacturer || 'Unknown',
                lastSeen: Date.now()
            });
        }

        // Update timeline
        this.deviceTimeline.push({
            time: Date.now(),
            count: this.devices.size
        });

        // Keep only last 60 data points
        if (this.deviceTimeline.length > 60) {
            this.deviceTimeline.shift();
        }

        this.render();
    }

    render() {
        this.renderDeviceList();
        this.renderRadar();
        this.renderAnalytics();
        this.renderMovementDetection();
        this.renderTimeline();
        this.renderHistogram();
        if (this.selectedDevice) {
            this.renderSignalHistory();
        }
    }

    updateSessionStats() {
        // Update uptime
        const uptime = Math.floor((Date.now() - this.sessionStart) / 1000);
        const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (uptime % 60).toString().padStart(2, '0');
        document.getElementById('uptime').textContent = `${hours}:${minutes}:${seconds}`;

        // Update scan rate (devices per minute)
        const scanRate = uptime > 0 ? Math.round((this.knownDevices.size / uptime) * 60) : 0;
        document.getElementById('scan-rate').textContent = `${scanRate}/min`;
    }

    renderDeviceList() {
        const deviceList = document.getElementById('device-list');
        const deviceCount = document.getElementById('device-count');

        deviceCount.textContent = this.devices.size;
        deviceList.innerHTML = '';

        const sortedDevices = Array.from(this.devices.values())
            .sort((a, b) => b.rssi - a.rssi);

        sortedDevices.forEach(device => {
            const item = document.createElement('div');
            item.className = 'device-item';
            if (this.selectedDevice === device.mac) {
                item.classList.add('selected');
            }

            // Calculate signal strength percentage (RSSI -30 to -100 range)
            const signalPercent = Math.max(0, Math.min(100, ((device.rssi + 100) / 70) * 100));

            let barColor;
            if (device.proximity === 'immediate') barColor = '#ff0040';
            else if (device.proximity === 'near') barColor = '#ffa500';
            else barColor = '#00ff41';

            const iconUrl = this.getManufacturerIcon(device.manufacturer);

            item.innerHTML = `
                <div class="device-header">
                    ${iconUrl ? `<img src="${iconUrl}" class="manuf-icon" alt="${device.manufacturer}">` : ''}
                    <div class="device-name">${device.name}</div>
                </div>
                <div class="device-mac">${device.mac}</div>
                ${device.manufacturer && device.manufacturer !== 'Unknown' ? `<div class="device-vendor">${device.manufacturer}</div>` : ''}
                <div class="device-rssi">
                    <span>RSSI: ${device.rssi} dBm</span>
                    <span>${device.proximity.toUpperCase()}</span>
                </div>
                <div class="rssi-bar">
                    <div class="rssi-fill" style="width: ${signalPercent}%; background: ${barColor};"></div>
                </div>
            `;

            item.addEventListener('click', () => {
                this.selectedDevice = device.mac;
                this.render();
            });

            // Add hover tooltip
            item.addEventListener('mouseenter', (e) => {
                this.showDeviceTooltip(e, device);
            });

            item.addEventListener('mouseleave', () => {
                this.hideDeviceTooltip();
            });

            deviceList.appendChild(item);
        });
    }

    renderRadar() {
        const ctx = this.radarCtx;
        const width = this.radarCanvas.width;
        const height = this.radarCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear canvas
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, width, height);

        // Draw radar circles (proximity zones)
        const zones = [
            { radius: 100, color: '#ff0040', label: 'immediate' },
            { radius: 200, color: '#ffa500', label: 'near' },
            { radius: 290, color: '#00ff41', label: 'far' }
        ];

        zones.forEach(zone => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, zone.radius, 0, Math.PI * 2);
            ctx.strokeStyle = zone.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff41';
        ctx.fill();

        // Draw radar sweep line (animated)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.radarSweepAngle);
        const gradient = ctx.createLinearGradient(0, 0, 0, -290);
        gradient.addColorStop(0, 'rgba(0, 255, 65, 0)');
        gradient.addColorStop(1, 'rgba(0, 255, 65, 0.3)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 290, -Math.PI / 12, Math.PI / 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Increment sweep angle
        this.radarSweepAngle += 0.02;

        // Draw devices
        this.devicePositions.clear();
        let angle = 0;
        const angleStep = (Math.PI * 2) / Math.max(1, this.devices.size);

        Array.from(this.devices.values()).forEach((device) => {
            let radius;
            let color;

            if (device.proximity === 'immediate') {
                radius = 80;
                color = '#ff0040';
            } else if (device.proximity === 'near') {
                radius = 180;
                color = '#ffa500';
            } else {
                radius = 270;
                color = '#00ff41';
            }

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Store position for click detection
            this.devicePositions.set(device.mac, { x, y, device });

            // Draw connecting line
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Highlight if hovered or selected
            const isHovered = this.hoveredDevice === device.mac;
            const isSelected = this.selectedDevice === device.mac;

            // Draw device point
            ctx.beginPath();
            ctx.arc(x, y, isHovered || isSelected ? 8 : 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Pulsing effect for moving devices
            if (device.movement > 50) {
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Draw label on hover
            if (isHovered) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(x + 12, y - 20, 150, 40);
                ctx.strokeStyle = color;
                ctx.strokeRect(x + 12, y - 20, 150, 40);

                ctx.fillStyle = color;
                ctx.font = '11px "Courier New"';
                ctx.fillText(device.name.substring(0, 18), x + 16, y - 5);
                ctx.fillText(`${device.rssi} dBm`, x + 16, y + 10);
            }

            angle += angleStep;
        });
    }

    renderAnalytics() {
        const totalDevices = document.getElementById('total-devices');
        const immediateCount = document.getElementById('immediate-count');
        const nearCount = document.getElementById('near-count');
        const farCount = document.getElementById('far-count');

        let immediate = 0, near = 0, far = 0;

        this.devices.forEach(device => {
            if (device.proximity === 'immediate') immediate++;
            else if (device.proximity === 'near') near++;
            else far++;
        });

        totalDevices.textContent = this.devices.size;
        immediateCount.textContent = immediate;
        nearCount.textContent = near;
        farCount.textContent = far;
    }

    renderMovementDetection() {
        const movementGrid = document.getElementById('movement-grid');
        movementGrid.innerHTML = '';

        const sortedByMovement = Array.from(this.devices.values())
            .sort((a, b) => b.movement - a.movement)
            .slice(0, 6); // Show top 6 devices

        sortedByMovement.forEach(device => {
            const item = document.createElement('div');
            const isMoving = device.movement > 30;
            const metrics = this.movementMetrics.get(device.mac) || {};

            // Determine status color and icon
            let statusColor = '#00ff41'; // Green for stationary
            let statusText = 'STATIONARY';
            let velocityText = '';

            if (device.movement > 60) {
                statusColor = '#ff0040'; // Red for high movement
                statusText = 'ACTIVE MOVEMENT';
            } else if (device.movement > 30) {
                statusColor = '#ffa500'; // Orange for moderate movement
                statusText = 'MOVING';
            }

            // Add direction and velocity info if moving
            if (metrics.direction && device.movement > 30) {
                const directionIcon = metrics.direction === 'approaching' ? '→' : '←';
                const velocityLabel = metrics.velocity === 'fast' ? 'FAST' :
                                     metrics.velocity === 'medium' ? 'MED' : 'SLOW';
                velocityText = `${directionIcon} ${velocityLabel} ${metrics.direction.toUpperCase()}`;
            }

            item.className = `movement-item ${isMoving ? 'moving' : 'stationary'}`;
            item.innerHTML = `
                <div class="movement-info">
                    <h4>${device.name}</h4>
                    <p>${device.mac}</p>
                    <p style="color: ${statusColor}; font-weight: bold;">
                        ${statusText}
                    </p>
                    ${velocityText ? `<p style="color: ${statusColor}; font-size: 0.8rem;">
                        ${velocityText}
                    </p>` : ''}
                </div>
                <div class="confidence-meter">
                    <div class="confidence-value" style="color: ${statusColor};">
                        ${device.movement}%
                    </div>
                    <div class="confidence-label">MOVEMENT</div>
                    ${metrics.stdDev ? `<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px;">
                        σ: ${metrics.stdDev.toFixed(1)} dBm
                    </div>` : ''}
                </div>
            `;
            movementGrid.appendChild(item);
        });
    }

    renderSignalHistory() {
        const ctx = this.historyCtx;
        const width = this.historyCanvas.width;
        const height = this.historyCanvas.height;
        const history = this.signalHistory.get(this.selectedDevice) || [];

        // Clear canvas
        ctx.fillStyle = '#0f1729';
        ctx.fillRect(0, 0, width, height);

        if (history.length < 2) return;

        // Draw grid
        ctx.strokeStyle = '#1a2332';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw signal line
        ctx.beginPath();
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;

        const stepX = width / (this.maxHistoryLength - 1);

        history.forEach((rssi, index) => {
            const x = index * stepX;
            // Map RSSI (-100 to -30) to canvas height
            const normalizedRSSI = (rssi + 100) / 70; // 0 to 1
            const y = height - (normalizedRSSI * height);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        history.forEach((rssi, index) => {
            const x = index * stepX;
            const normalizedRSSI = (rssi + 100) / 70;
            const y = height - (normalizedRSSI * height);

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff41';
            ctx.fill();
        });
    }

    updateTimestamp() {
        const timestamp = document.getElementById('timestamp');
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timestamp.textContent = formatted;
    }

    async fetchWardrivingData() {
        try {
            const response = await fetch('/api/wardriving');
            const data = await response.json();
            this.wardrivingData = data;
            this.renderWardrivingTable();
            this.updateManufacturerFilter();
        } catch (error) {
            console.error('Error fetching wardriving data:', error);
        }
    }

    updateManufacturerFilter() {
        const manufacturers = new Set();
        Object.values(this.wardrivingData).forEach(device => {
            if (device.manuf && device.manuf !== 'Unknown') {
                const normalized = ManufacturerIcons.normalizeManufacturer(device.manuf);
                if (normalized) {
                    manufacturers.add(normalized);
                }
            }
        });

        const select = document.getElementById('manufacturer-filter');
        const currentValue = select.value;

        select.innerHTML = '<option value="all">ALL MANUFACTURERS</option>';
        Array.from(manufacturers).sort().forEach(manuf => {
            const option = document.createElement('option');
            option.value = manuf;
            option.textContent = manuf.toUpperCase();
            select.appendChild(option);
        });

        select.value = currentValue;
    }

    renderWardrivingTable() {
        const tbody = document.getElementById('wardriving-tbody');
        const totalBadge = document.getElementById('total-captured');

        // Filter data
        let filteredData = Object.entries(this.wardrivingData).filter(([, device]) => {
            const searchMatch = !this.searchFilter ||
                device.addr.toLowerCase().includes(this.searchFilter) ||
                (device.name && device.name.toLowerCase().includes(this.searchFilter)) ||
                (device.vendor && device.vendor.toLowerCase().includes(this.searchFilter)) ||
                (device.manuf && device.manuf.toLowerCase().includes(this.searchFilter));

            const normalizedManuf = ManufacturerIcons.normalizeManufacturer(device.manuf);
            const manufMatch = this.manufacturerFilter === 'all' ||
                normalizedManuf === this.manufacturerFilter;

            return searchMatch && manufMatch;
        });

        totalBadge.textContent = `${filteredData.length} DEVICES`;
        tbody.innerHTML = '';

        filteredData.forEach(([index, device]) => {
            const row = document.createElement('tr');

            const rssi = device.rssi || -100;
            let rssiClass = 'rssi-weak';
            if (rssi >= -50) rssiClass = 'rssi-good';
            else if (rssi >= -70) rssiClass = 'rssi-medium';

            const iconUrl = this.getManufacturerIcon(device.manuf || device.vendor);
            const uuidStr = Array.isArray(device.uuid) ? device.uuid.join(', ') : (device.uuid || 'N/A');

            row.innerHTML = `
                <td class="index-col">${index}</td>
                <td>${iconUrl ? `<img src="${iconUrl}" class="table-icon" alt="">` : '-'}</td>
                <td class="rssi-col ${rssiClass}">${rssi} dBm</td>
                <td class="mac-col">${device.addr}</td>
                <td>${device.manuf || 'Unknown'}</td>
                <td>${device.vendor || 'Unknown'}</td>
                <td>${device.name || 'Unknown'}</td>
                <td class="uuid-list" title="${uuidStr}">${uuidStr}</td>
            `;

            // Add hover tooltip to wardriving table
            row.addEventListener('mouseenter', (e) => {
                const wardrivingDevice = {
                    name: device.name || 'Unknown',
                    mac: device.addr,
                    manufacturer: device.manuf || device.vendor || 'Unknown',
                    rssi: rssi,
                    proximity: rssi >= -50 ? 'immediate' : rssi >= -70 ? 'near' : 'far',
                    movement: 0
                };
                this.showDeviceTooltip(e, wardrivingDevice);
            });

            row.addEventListener('mouseleave', () => {
                this.hideDeviceTooltip();
            });

            tbody.appendChild(row);
        });
    }

    exportData() {
        const dataStr = JSON.stringify(this.wardrivingData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `bluemap_wardriving_${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    renderTimeline() {
        const ctx = this.timelineCtx;
        const width = this.timelineCanvas.width;
        const height = this.timelineCanvas.height;

        // Clear canvas
        ctx.fillStyle = '#0f1729';
        ctx.fillRect(0, 0, width, height);

        if (this.deviceTimeline.length < 2) return;

        // Draw grid
        ctx.strokeStyle = '#1a2332';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Find max count for scaling
        const maxCount = Math.max(...this.deviceTimeline.map(d => d.count), 1);

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;

        const stepX = width / (this.deviceTimeline.length - 1);

        this.deviceTimeline.forEach((point, index) => {
            const x = index * stepX;
            const y = height - ((point.count / maxCount) * height * 0.9);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        this.deviceTimeline.forEach((point, index) => {
            const x = index * stepX;
            const y = height - ((point.count / maxCount) * height * 0.9);

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff41';
            ctx.fill();
        });
    }

    renderHistogram() {
        const ctx = this.histogramCtx;
        const width = this.histogramCanvas.width;
        const height = this.histogramCanvas.height;

        // Clear canvas
        ctx.fillStyle = '#0f1729';
        ctx.fillRect(0, 0, width, height);

        if (this.devices.size === 0) return;

        // Create RSSI bins (-100 to -30, every 10 dBm)
        const bins = {};
        for (let i = -100; i <= -30; i += 10) {
            bins[i] = 0;
        }

        // Count devices in each bin
        this.devices.forEach(device => {
            const rssi = device.rssi;
            const binKey = Math.floor(rssi / 10) * 10;
            if (bins[binKey] !== undefined) {
                bins[binKey]++;
            }
        });

        // Find max for scaling
        const maxBin = Math.max(...Object.values(bins), 1);

        // Draw bars
        const binCount = Object.keys(bins).length;
        const barWidth = (width / binCount) - 4;

        Object.entries(bins).forEach(([rssi, count], index) => {
            const barHeight = (count / maxBin) * height * 0.9;
            const x = index * (barWidth + 4);
            const y = height - barHeight;

            // Color based on RSSI range
            let color;
            if (parseInt(rssi) >= -50) color = '#00ff41';
            else if (parseInt(rssi) >= -70) color = '#ffa500';
            else color = '#ff0040';

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw count on top if > 0
            if (count > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '9px "Courier New"';
                ctx.fillText(count.toString(), x + barWidth / 2 - 4, y - 3);
            }
        });
    }

    startMonitoring() {
        // Initial update
        this.updateDevices();

        // Update devices periodically
        setInterval(() => {
            this.updateDevices();

            // Auto-update wardriving tab if active
            if (this.currentTab === 'wardriving') {
                this.fetchWardrivingData();
            }
        }, this.updateInterval);

        // Update timestamp and session stats every second
        setInterval(() => {
            this.updateTimestamp();
            this.updateSessionStats();
        }, 1000);

        // Continuous radar animation
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.renderRadar();
            }
        }, 50); // 20 FPS for smooth animation
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BLEProximityMonitor();
});
