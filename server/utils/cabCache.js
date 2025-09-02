// cabCache.js
import {redisClient} from "../config/redisclient.js";

// Save cab location
export async function setCabLocation(cabId, lat, lon) {
  const key = `cab:${cabId}:location`;
  const value = JSON.stringify({
    lat,
    lon,
    updatedAt: Date.now(),
  });
  await redisClient.set(key, value);
}

// Get cab location
export async function getCabLocation(cabId) {
  const key = `cab:${cabId}:location`;
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
}

// Get multiple cabs (for allocation, etc.)
export async function getAllCabLocations(cabIds) {
  const keys = cabIds.map((id) => `cab:${id}:location`);
  const values = await redisClient.mGet(keys);
  return values.map((v, i) =>
    v ? { cabId: cabIds[i], ...JSON.parse(v) } : null
  );
}

// Delete cab location (if needed)
export async function removeCabLocation(cabId) {
  const key = `cab:${cabId}:location`;
  await redisClient.del(key);
}
