/**
 * Retrieves geographic coordinates for a given address using the OpenStreetMap Nominatim API.
 *
 * This asynchronous function sends a GET request with the provided address and parses the JSON response.
 * If a result is found, it returns an object containing the numerical latitude and longitude.
 *
 * @param address - The address to be converted into geographic coordinates.
 * @returns A promise that resolves to an object with latitude and longitude, or null if no coordinates are found.
 */
export async function getGeoLocation(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`,
      {
        headers: {
          "User-Agent": "HelpConnect Application",
        },
      }
    );
    const data = await response.json();

    if (data?.[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
}
