import type { LatLng } from './transport';

export type IncidentType='breakdown'|'accident'|'operational'|'heavy_traffic'|'road_restriction'|'significant_delay'|'cancelled_trip'|'route_change';
export type IncidentStatus='reported'|'under_review'|'in_progress'|'resolved'|'closed';
export interface OperationalIncident { id:string;type:IncidentType;status:IncidentStatus;routeId:string;vehicleId?:string;internalLocation?:LatLng;reportedAt:string;updatedAt:string;estimatedResolution?:string;operatorNote?:string;impactMinutes?:number;demo:boolean }
/** Safe passenger projection: deliberately has no vehicle ID, coordinates or internal notes. */
export interface PassengerIncident { id:string;type:IncidentType;status:IncidentStatus;routeId:string;reportedAt:string;updatedAt:string;estimatedResolution?:string;impactMinutes?:number;title:string;message:string;demo:boolean }
export interface TripRecord { id:string;serviceDate:string;boardingTime:string;routeId:string;vehicleId?:string;originStopId:string;destinationStopId?:string;scheduledDeparture:string;scheduledArrival?:string;actualArrival?:string;estimatedDurationMinutes?:number;delayMinutes?:number;incidentId?:string;demo:boolean }
