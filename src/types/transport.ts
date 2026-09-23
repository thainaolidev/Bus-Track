export type LatLng = [number, number];

export interface Stop { id: string; name: string; latitude: number; longitude: number; routes: string[] }
export interface Route { id: string; name: string; color: string; origin: string; destination: string; coordinates: LatLng[]; stops: string[]; distanceKm: number; displayRoute: string; nextStop: string; estimatedMinutes: number }
export interface VehiclePosition { vehicleId: string; routeId: string; latitude: number; longitude: number; timestamp: string }
export interface Vehicle extends VehiclePosition { status: 'simulated'|'active'|'inactive' }
export interface Arrival { id: string; routeId: string; stopId: string; estimatedMinutes: number; updatedAt: string; simulated: boolean }
export interface ServiceAlert { id: string; title: string; description: string; routeId?: string; stopId?: string; severity: 'info'|'warning'|'critical'; startAt: string; endAt?: string }

export interface UserProfile { id: string; name: string; avatar: string; email?: string; createdAt?: string; updatedAt?: string }

// Component-friendly legacy views are kept while the app migrates to the normalized entities above.
export interface RouteStop { id: string; name: string; coordinates: LatLng }
export interface BusRoute { id: string; name: string; to: string; nextStop: string; time: number; color: string; distanceKm: number; coordinates: LatLng[]; stops: RouteStop[]; route: string }
