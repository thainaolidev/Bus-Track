import { routes as mockRoutes } from '../data/routes';
import type { Arrival, BusRoute, Route, ServiceAlert, Stop, Vehicle } from '../types/transport';
import { apiConfig, apiUrl } from '../api/config';

export interface TransportService {
  getRoutes(): Promise<Route[]>;
  getRouteById(id: string): Promise<Route | null>;
  getStops(): Promise<Stop[]>;
  getStopById(id: string): Promise<Stop | null>;
  getVehicles(): Promise<Vehicle[]>;
  getArrivals(): Promise<Arrival[]>;
  getServiceAlerts(): Promise<ServiceAlert[]>;
}

function toRoute(route: BusRoute): Route {
  return { id: route.id, name: route.name, color: route.color, origin: route.stops[0]?.name || 'Terminal Rodoviário', destination: route.to, coordinates: route.coordinates, stops: route.stops.map(stop => stop.id), distanceKm: route.distanceKm, displayRoute: route.route, nextStop: route.nextStop, estimatedMinutes: route.time };
}
const normalizedRoutes = mockRoutes.map(toRoute);
const stopMap = new Map<string, Stop>();
for (const route of mockRoutes) for (const stop of route.stops) {
  const found = stopMap.get(stop.id);
  if (found) { if (!found.routes.includes(route.id)) found.routes.push(route.id); }
  else stopMap.set(stop.id, { id: stop.id, name: stop.name, latitude: stop.coordinates[0], longitude: stop.coordinates[1], routes: [route.id] });
}
const stops = [...stopMap.values()];

/** Mock implementation of the transport API. It intentionally identifies all generated data as simulated. */
export const mockTransportService: TransportService = {
  async getRoutes() { return normalizedRoutes; },
  async getRouteById(id) { return normalizedRoutes.find(route => route.id === id) || null; },
  async getStops() { return stops; },
  async getStopById(id) { return stops.find(stop => stop.id === id) || null; },
  async getVehicles() { return mockRoutes.map((route, index) => { const point = route.coordinates[Math.floor(route.coordinates.length * [.22,.41,.61][index])]; return { vehicleId: `demo-${route.id}`, routeId: route.id, latitude: point[0], longitude: point[1], timestamp: new Date().toISOString(), status: 'simulated' as const }; }); },
  async getArrivals() { return mockRoutes.flatMap(route => route.stops.map((stop,index) => ({ id: `${route.id}-${stop.id}`, routeId: route.id, stopId: stop.id, estimatedMinutes: route.time + index * 3, updatedAt: new Date().toISOString(), simulated: true }))); },
  async getServiceAlerts() { return []; }
};

/** Selects the source here so consumers stay independent from mock/API implementation. */
async function getJson<T>(path:string):Promise<T>{const response=await fetch(apiUrl(path),{headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`Pedido à API falhou (${response.status}).`);return response.json() as Promise<T>;}
export const apiTransportService:TransportService={
  getRoutes:()=>getJson<Route[]>('/routes'),getRouteById:async id=>(await getJson<Route[]>('/routes')).find(item=>item.id===id)||null,
  getStops:()=>getJson<Stop[]>('/stops'),getStopById:async id=>(await getJson<Stop[]>('/stops')).find(item=>item.id===id)||null,
  getVehicles:()=>getJson<Vehicle[]>('/vehicles'),getArrivals:()=>getJson<Arrival[]>('/arrivals'),getServiceAlerts:()=>getJson<ServiceAlert[]>('/service-alerts')
};
export const transportService: TransportService = apiConfig.configured ? apiTransportService : mockTransportService;
