/**
 * Geolocation Service
 * Converts CEP to coordinates using Nominatim (OpenStreetMap) with reverse geocoding
 * Free API - No key required
 */

import * as Location from 'expo-location';

export interface CoordinatesResult {
    latitude: number;
    longitude: number;
    address?: string;
    street?: string;
    city?: string;
    state?: string;
}

/**
 * Converts Brazilian CEP to coordinates using Nominatim API
 * @param cep - Brazilian postal code (with or without hyphen: 12345-678 or 12345678)
 * @returns Coordinates and address or null if not found
 */
export const getCoordsFromCEP = async (cep: string): Promise<CoordinatesResult | null> => {
    try {
        // Remove hyphen if present
        const cleanCEP = cep.replace('-', '');
        
        // Validate CEP format (8 digits)
        if (!/^\d{8}$/.test(cleanCEP)) {
            console.error('[Geolocation] Invalid CEP format:', cep);
            return null;
        }

        // Convert CEP to address format for Nominatim
        // Example: 01310100 (São Paulo, Av Paulista)
        // Format for Nominatim: "01310-100, Brazil" or lookup by postal code
        const formattedCEP = `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
        const query = `${formattedCEP}, Brazil`;

        console.log('[Geolocation] Fetching coordinates for CEP:', formattedCEP);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'SonoTela-App/1.0 (React Native Expo)',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const results = await response.json();

        if (!results || results.length === 0) {
            console.warn('[Geolocation] No results found for CEP:', formattedCEP);
            return null;
        }

        // Use first result and extract address components
        const result = results[0];
        const address = result.address || {};
        
        const coords: CoordinatesResult = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name || undefined,
            street: address.road || undefined,
            city: address.city || address.town || address.municipality || undefined,
            state: address.state || undefined,
        };

        console.log('[Geolocation] Found coordinates:', coords);
        return coords;
    } catch (error) {
        console.error('[Geolocation] Error fetching coordinates:', error);
        return null;
    }
};

/**
 * Calculates distance between two coordinates in kilometers
 * Uses Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

/**
 * Checks if current location is within radius of home
 * @param currentLat - Current latitude
 * @param currentLon - Current longitude
 * @param homeLat - Home latitude
 * @param homeLon - Home longitude
 * @param radiusKm - Radius in kilometers (default: 2km)
 * @returns true if within home radius
 */
export const isNearHome = (
    currentLat: number,
    currentLon: number,
    homeLat: number,
    homeLon: number,
    radiusKm: number = 2
): boolean => {
    const distance = calculateDistance(currentLat, currentLon, homeLat, homeLon);
    return distance <= radiusKm;
};

/**
 * Reverse geocoding: Converts latitude/longitude to readable address
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Readable address with street, city, state
 */
export const getAddressFromCoords = async (
    latitude: number,
    longitude: number
): Promise<CoordinatesResult | null> => {
    try {
        console.log('[Geolocation] Reverse geocoding:', latitude, longitude);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'SonoTela-App/1.0 (React Native Expo)',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim reverse geocoding error: ${response.status}`);
        }

        const result = await response.json();
        const address = result.address || {};

        const coords: CoordinatesResult = {
            latitude,
            longitude,
            address: result.display_name || undefined,
            street: address.road || undefined,
            city: address.city || address.town || address.municipality || undefined,
            state: address.state || undefined,
        };

        console.log('[Geolocation] Reverse geocoding result:', coords);
        return coords;
    } catch (error) {
        console.error('[Geolocation] Error reverse geocoding:', error);
        return null;
    }
};

/**
 * Gets current device location using Expo Location
 * Requires location permission to be granted
 * @returns Current latitude/longitude or null if error/denied
 */
export const getCurrentLocation = async (): Promise<CoordinatesResult | null> => {
    try {
        console.log('[Geolocation] Requesting current location permission...');

        // Request permission if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            console.warn('[Geolocation] Location permission denied');
            return null;
        }

        console.log('[Geolocation] Getting current position...');
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        console.log('[Geolocation] Current position:', location.coords);

        // Reverse geocode the location
        const address = await getAddressFromCoords(
            location.coords.latitude,
            location.coords.longitude
        );

        return address;
    } catch (error) {
        console.error('[Geolocation] Error getting current location:', error);
        return null;
    }
};
