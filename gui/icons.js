// Manufacturer icon mappings
const ManufacturerIcons = {
    // Normalize manufacturer name to a single canonical form
    normalizeManufacturer(manufacturer) {
        if (!manufacturer) return null;

        const manuf = manufacturer.toLowerCase();

        // Apple variants
        if (manuf.includes('apple')) return 'Apple';

        // Samsung variants
        if (manuf.includes('samsung')) return 'Samsung';

        // Google variants
        if (manuf.includes('google')) return 'Google';

        // Microsoft variants
        if (manuf.includes('microsoft')) return 'Microsoft';

        // Sony variants
        if (manuf.includes('sony')) return 'Sony';

        // Intel variants
        if (manuf.includes('intel')) return 'Intel';

        // LG variants
        if (manuf.includes('lg')) return 'LG';

        // Dell variants
        if (manuf.includes('dell')) return 'Dell';

        // HP variants
        if (manuf.includes('hp') || manuf.includes('hewlett')) return 'HP';

        // Texas Instruments variants
        if (manuf.includes('texas') || manuf.includes('ti')) return 'Texas Instruments';

        // Motorola variants
        if (manuf.includes('motorola')) return 'Motorola';

        // Qualcomm variants
        if (manuf.includes('qualcomm')) return 'Qualcomm';

        // Xiaomi variants
        if (manuf.includes('xiaomi')) return 'Xiaomi';

        // Huawei variants
        if (manuf.includes('huawei')) return 'Huawei';

        // Lenovo variants
        if (manuf.includes('lenovo')) return 'Lenovo';

        // Asus variants
        if (manuf.includes('asus')) return 'Asus';

        // Broadcom
        if (manuf.includes('broadcom')) return 'Broadcom';

        // Realtek
        if (manuf.includes('realtek')) return 'Realtek';

        // Nordic
        if (manuf.includes('nordic')) return 'Nordic';

        // Espressif (ESP32/ESP8266)
        if (manuf.includes('espressif')) return 'Espressif';

        // Raspberry Pi
        if (manuf.includes('raspberry')) return 'Raspberry Pi';

        // OnePlus
        if (manuf.includes('oneplus')) return 'OnePlus';

        // Oppo
        if (manuf.includes('oppo')) return 'Oppo';

        // Vivo
        if (manuf.includes('vivo')) return 'Vivo';

        return manufacturer;
    },

    getIcon(manufacturer) {
        if (!manufacturer) return null;

        const manuf = manufacturer.toLowerCase();

        // Apple - White Apple logo
        if (manuf.includes('apple')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23000000"/%3E%3Cpath d="M17.5 11.5c0-1.4.6-2.6 1.5-3.5-.6-.8-1.5-1.3-2.5-1.4-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.6 0-3 1-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.7-.1-.1-.2-.2-.2-.6zm-2.8-8.3c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3z" fill="%23ffffff"/%3E%3C/svg%3E';
        }

        // Samsung - Blue S
        if (manuf.includes('samsung')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%231428A0"/%3E%3Ctext x="12" y="17" font-size="16" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3ES%3C/text%3E%3C/svg%3E';
        }

        // Google - Google G
        if (manuf.includes('google')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23ffffff"/%3E%3Cpath d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="%234285F4"/%3E%3C/svg%3E';
        }

        // Microsoft - Windows logo
        if (manuf.includes('microsoft')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23ffffff"/%3E%3Cpath fill="%23f25022" d="M3 3h8.5v8.5H3z"/%3E%3Cpath fill="%2300a4ef" d="M12.5 3H21v8.5h-8.5z"/%3E%3Cpath fill="%237fba00" d="M3 12.5h8.5V21H3z"/%3E%3Cpath fill="%23ffb900" d="M12.5 12.5H21V21h-8.5z"/%3E%3C/svg%3E';
        }

        // HP - Blue HP
        if (manuf.includes('hp') || manuf.includes('hewlett')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%230096D6"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3Ehp%3C/text%3E%3C/svg%3E';
        }

        // Sony - Black Sony
        if (manuf.includes('sony')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23000000"/%3E%3Ctext x="12" y="16" font-size="7" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3ESONY%3C/text%3E%3C/svg%3E';
        }

        // Intel - Blue Intel
        if (manuf.includes('intel')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%230071C5"/%3E%3Ctext x="12" y="16" font-size="7" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EINTEL%3C/text%3E%3C/svg%3E';
        }

        // Dell - Blue Dell
        if (manuf.includes('dell')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23007DB8"/%3E%3Ctext x="12" y="16" font-size="8" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EDELL%3C/text%3E%3C/svg%3E';
        }

        // LG - Red LG
        if (manuf.includes('lg')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23A50034"/%3E%3Ctext x="12" y="16" font-size="12" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3ELG%3C/text%3E%3C/svg%3E';
        }

        // Motorola
        if (manuf.includes('motorola')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%2300B0B9"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EM%3C/text%3E%3C/svg%3E';
        }

        // Qualcomm
        if (manuf.includes('qualcomm')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%233253DC"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EQ%3C/text%3E%3C/svg%3E';
        }

        // Xiaomi
        if (manuf.includes('xiaomi')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23FF6900"/%3E%3Ctext x="12" y="16" font-size="9" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EMi%3C/text%3E%3C/svg%3E';
        }

        // Broadcom
        if (manuf.includes('broadcom')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23CC0000"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EB%3C/text%3E%3C/svg%3E';
        }

        // Realtek
        if (manuf.includes('realtek')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%230066CC"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3ER%3C/text%3E%3C/svg%3E';
        }

        // Nordic
        if (manuf.includes('nordic')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%2300A9CE"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EN%3C/text%3E%3C/svg%3E';
        }

        // Espressif
        if (manuf.includes('espressif')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23E7352C"/%3E%3Ctext x="12" y="16" font-size="8" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3EESP%3C/text%3E%3C/svg%3E';
        }

        // Raspberry Pi
        if (manuf.includes('raspberry')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23C51A4A"/%3E%3Ctext x="12" y="17" font-size="14" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3E%CF%80%3C/text%3E%3C/svg%3E';
        }

        // Texas Instruments
        if (manuf.includes('texas') || manuf.includes('ti ')) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23CC0000"/%3E%3Ctext x="12" y="16" font-size="10" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold"%3ETI%3C/text%3E%3C/svg%3E';
        }

        // Generic Bluetooth icon for unknown
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="3" fill="%23555555"/%3E%3Cpath d="M12 2l5 5-3.5 3.5L17 14l-5 5v-7.5L9 14.5 7.5 13 11 9.5 7.5 6 9 4.5 12 7.5V2z" fill="white"/%3E%3C/svg%3E';
    }
};
