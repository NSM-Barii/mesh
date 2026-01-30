// BLE Device Fingerprint Database
// Identifies specific device models based on manufacturer data, service UUIDs, and names

const DeviceFingerprints = {
    patterns: [
        // Apple Devices
        {
            type: 'AirPods Pro',
            icon: '🎧',
            category: 'audio',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       device.name?.toLowerCase().includes('airpods') &&
                       (device.uuid?.includes('180F') || device.uuid?.includes('180A'));
            }
        },
        {
            type: 'AirPods',
            icon: '🎧',
            category: 'audio',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       device.name?.toLowerCase().includes('airpods');
            }
        },
        {
            type: 'AirTag',
            icon: '🏷️',
            category: 'tracker',
            threat: 'potential_tracking',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       (device.name?.toLowerCase().includes('airtag') ||
                        device.uuid?.includes('FD44') ||
                        device.uuid?.includes('FEAA'));
            }
        },
        {
            type: 'Apple Watch',
            icon: '⌚',
            category: 'wearable',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       device.name?.toLowerCase().includes('watch');
            }
        },
        {
            type: 'iPhone',
            icon: '📱',
            category: 'phone',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       (device.name?.toLowerCase().includes('iphone') ||
                        (device.name === 'Unknown Device' && device.uuid?.includes('180D')));
            }
        },
        {
            type: 'iPad',
            icon: '📱',
            category: 'tablet',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       device.name?.toLowerCase().includes('ipad');
            }
        },
        {
            type: 'MacBook',
            icon: '💻',
            category: 'computer',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       (device.name?.toLowerCase().includes('macbook') ||
                        device.name?.toLowerCase().includes('mac'));
            }
        },

        // Trackers (Security Concern)
        {
            type: 'Tile Tracker',
            icon: '🏷️',
            category: 'tracker',
            threat: 'potential_tracking',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('tile') ||
                       device.name?.toLowerCase().includes('tile');
            }
        },
        {
            type: 'Samsung SmartTag',
            icon: '🏷️',
            category: 'tracker',
            threat: 'potential_tracking',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('samsung') &&
                       device.name?.toLowerCase().includes('tag');
            }
        },

        // Fitness Trackers
        {
            type: 'Fitbit',
            icon: '⌚',
            category: 'wearable',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('fitbit') ||
                       device.name?.toLowerCase().includes('fitbit');
            }
        },
        {
            type: 'Garmin Watch',
            icon: '⌚',
            category: 'wearable',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('garmin') ||
                       device.name?.toLowerCase().includes('garmin');
            }
        },
        {
            type: 'Mi Band',
            icon: '⌚',
            category: 'wearable',
            match: (device) => {
                return (device.manufacturer?.toLowerCase().includes('xiaomi') ||
                        device.manufacturer?.toLowerCase().includes('huami')) &&
                       (device.name?.toLowerCase().includes('mi band') ||
                        device.name?.toLowerCase().includes('amazfit'));
            }
        },

        // Headphones/Audio
        {
            type: 'Sony Headphones',
            icon: '🎧',
            category: 'audio',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('sony') &&
                       (device.name?.toLowerCase().includes('wh') ||
                        device.name?.toLowerCase().includes('wf'));
            }
        },
        {
            type: 'Bose Headphones',
            icon: '🎧',
            category: 'audio',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('bose') ||
                       device.name?.toLowerCase().includes('bose');
            }
        },
        {
            type: 'Samsung Buds',
            icon: '🎧',
            category: 'audio',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('samsung') &&
                       device.name?.toLowerCase().includes('buds');
            }
        },
        {
            type: 'JBL Speaker',
            icon: '🔊',
            category: 'audio',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('jbl') ||
                       device.name?.toLowerCase().includes('jbl');
            }
        },

        // Smart Home
        {
            type: 'Google Home',
            icon: '🏠',
            category: 'smart_home',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('google') &&
                       (device.name?.toLowerCase().includes('home') ||
                        device.name?.toLowerCase().includes('nest'));
            }
        },
        {
            type: 'Amazon Echo',
            icon: '🏠',
            category: 'smart_home',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('amazon') ||
                       device.name?.toLowerCase().includes('echo');
            }
        },
        {
            type: 'Ring Doorbell',
            icon: '🚪',
            category: 'smart_home',
            match: (device) => {
                return device.name?.toLowerCase().includes('ring');
            }
        },
        {
            type: 'Philips Hue',
            icon: '💡',
            category: 'smart_home',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('philips') &&
                       device.name?.toLowerCase().includes('hue');
            }
        },

        // Gaming
        {
            type: 'PlayStation Controller',
            icon: '🎮',
            category: 'gaming',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('sony') &&
                       (device.name?.toLowerCase().includes('dualshock') ||
                        device.name?.toLowerCase().includes('dualsense') ||
                        device.name?.toLowerCase().includes('wireless controller'));
            }
        },
        {
            type: 'Xbox Controller',
            icon: '🎮',
            category: 'gaming',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('microsoft') &&
                       device.name?.toLowerCase().includes('xbox');
            }
        },
        {
            type: 'Nintendo Switch',
            icon: '🎮',
            category: 'gaming',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('nintendo') ||
                       device.name?.toLowerCase().includes('joy-con') ||
                       device.name?.toLowerCase().includes('pro controller');
            }
        },

        // Keyboards/Mice
        {
            type: 'Logitech Keyboard',
            icon: '⌨️',
            category: 'peripheral',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('logitech') &&
                       device.name?.toLowerCase().includes('keyboard');
            }
        },
        {
            type: 'Logitech Mouse',
            icon: '🖱️',
            category: 'peripheral',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('logitech') &&
                       device.name?.toLowerCase().includes('mouse');
            }
        },
        {
            type: 'Apple Magic Keyboard',
            icon: '⌨️',
            category: 'peripheral',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       device.name?.toLowerCase().includes('keyboard');
            }
        },
        {
            type: 'Apple Magic Mouse',
            icon: '🖱️',
            category: 'peripheral',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('apple') &&
                       device.name?.toLowerCase().includes('mouse');
            }
        },

        // Phones
        {
            type: 'Samsung Phone',
            icon: '📱',
            category: 'phone',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('samsung') &&
                       (device.name?.toLowerCase().includes('galaxy') ||
                        device.name?.toLowerCase().includes('samsung'));
            }
        },
        {
            type: 'Google Pixel',
            icon: '📱',
            category: 'phone',
            match: (device) => {
                return device.manufacturer?.toLowerCase().includes('google') &&
                       device.name?.toLowerCase().includes('pixel');
            }
        },

        // Security Devices (Potential Threat)
        {
            type: 'Hidden Camera',
            icon: '📷',
            category: 'security',
            threat: 'surveillance',
            match: (device) => {
                return device.name?.toLowerCase().includes('camera') ||
                       device.name?.toLowerCase().includes('cam');
            }
        },

        // Generic fallbacks
        {
            type: 'Bluetooth Headphones',
            icon: '🎧',
            category: 'audio',
            match: (device) => {
                return device.uuid?.includes('110B') || // Audio Sink
                       device.name?.toLowerCase().includes('headphone') ||
                       device.name?.toLowerCase().includes('earbuds');
            }
        },
        {
            type: 'Smartwatch',
            icon: '⌚',
            category: 'wearable',
            match: (device) => {
                return device.name?.toLowerCase().includes('watch') &&
                       !device.manufacturer?.toLowerCase().includes('apple');
            }
        },
        {
            type: 'Bluetooth Keyboard',
            icon: '⌨️',
            category: 'peripheral',
            match: (device) => {
                return device.uuid?.includes('1812') && // HID Service
                       device.name?.toLowerCase().includes('keyboard');
            }
        }
    ],

    identify(device) {
        // Try to match against known patterns
        for (const pattern of this.patterns) {
            if (pattern.match(device)) {
                return {
                    type: pattern.type,
                    icon: pattern.icon,
                    category: pattern.category,
                    threat: pattern.threat || null
                };
            }
        }

        // Fallback to generic identification
        return this.genericIdentify(device);
    },

    genericIdentify(device) {
        // Basic categorization based on services
        const uuids = device.uuid || '';

        if (uuids.includes('180D') || uuids.includes('180F')) {
            return { type: 'Fitness Device', icon: '💪', category: 'wearable', threat: null };
        }
        if (uuids.includes('110B') || uuids.includes('110A')) {
            return { type: 'Audio Device', icon: '🔊', category: 'audio', threat: null };
        }
        if (uuids.includes('1812')) {
            return { type: 'HID Device', icon: '⌨️', category: 'peripheral', threat: null };
        }
        if (uuids.includes('181A') || uuids.includes('181B')) {
            return { type: 'Environmental Sensor', icon: '🌡️', category: 'sensor', threat: null };
        }

        // Unknown device
        return {
            type: 'Unknown Device',
            icon: '❓',
            category: 'unknown',
            threat: null
        };
    },

    getCategoryColor(category) {
        const colors = {
            'audio': '#3b82f6',
            'tracker': '#ef4444',
            'wearable': '#10b981',
            'phone': '#8b5cf6',
            'tablet': '#8b5cf6',
            'computer': '#6366f1',
            'smart_home': '#f59e0b',
            'gaming': '#ec4899',
            'peripheral': '#14b8a6',
            'security': '#ef4444',
            'sensor': '#06b6d4',
            'unknown': '#64748b'
        };
        return colors[category] || colors.unknown;
    },

    getThreatLevel(threat) {
        if (!threat) return null;

        const levels = {
            'potential_tracking': { level: 'warning', text: 'Tracking Device' },
            'surveillance': { level: 'danger', text: 'Surveillance Device' }
        };
        return levels[threat] || null;
    }
};
