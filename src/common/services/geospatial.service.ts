// src/common/services/geospatial.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeospatialService {
  private readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculate distance between two points in kilometers using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Generate a geohash (simplified version for demonstration)
   * In production, consider using a library like 'ngeohash'
   */
  generateGeohash(lat: number, lng: number, precision: number = 9): string {
    // This is a simplified version. For production, use a proper geohash library.
    return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
  }

  /**
   * Get approximate geohash neighbors for proximity searches
   */
  getGeohashNeighbors(geohash: string): string[] {
    // In a real implementation, this would generate adjacent geohashes
    // For now, we'll just return the original as we're not fully implementing geohashing
    return [geohash];
  }
}